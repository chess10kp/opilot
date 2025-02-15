// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use gtk::gdk;
use gtk::prelude::{ContainerExt, GtkWindowExt, MonitorExt, WidgetExt};
use gtk_layer_shell::{Edge, LayerShell};
use std::fs::OpenOptions;
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::{collections::HashMap, fs};
use tauri::command;
use tauri::{Manager, Window};

struct NodeProcess {
    child: Child,
}

impl NodeProcess {
    fn new() -> Result<Self, String> {
        let child = Command::new("node")
            .arg("gemini.js")
            .stdin(Stdio::piped())
            .stdout(Stdio::piped())
            .stderr(Stdio::inherit())
            .spawn()
            .map_err(|e| format!("Failed to spawn node process: {}", e))?;
        Ok(NodeProcess { child })
    }

    fn send_query(&mut self, query: &str) -> Result<String, String> {
        let stdin = self
            .child
            .stdin
            .as_mut()
            .ok_or("Failed to open stdin of node process")?;
        let request = serde_json::json!({
            "type": "query",
            "prompt": query
        });
        stdin
            .write_all(format!("{}\n", request).as_bytes())
            .map_err(|e| format!("Failed to write to node process stdin: {}", e))?;

        let stdout = self
            .child
            .stdout
            .as_mut()
            .ok_or("Failed to capture stdout of node process")?;
        let mut reader = BufReader::new(stdout);
        let mut response_line = String::new();
        reader
            .read_line(&mut response_line)
            .map_err(|e| format!("Failed to read from node process stdout: {}", e))?;
        Ok(response_line)
    }
}

type SharedNodeProcess = Arc<Mutex<NodeProcess>>;

#[command]
fn query_gemini(prompt: String, node: tauri::State<SharedNodeProcess>) -> Result<String, String> {
    let mut node_process = node.lock().unwrap();
    let response = node_process.send_query(&prompt)?;
    Ok(response)
}

#[command]
fn shutdown_node(node: tauri::State<SharedNodeProcess>) -> Result<(), String> {
    let mut node_process = node.lock().unwrap();
    node_process.child.kill().map_err(|e| e.to_string())?;
    Ok(())
}

#[command]
async fn parse_agenda(text: String) -> String {
    let agenda = Command::new("node")
        .arg("scheduler.js")
        .arg("agenda")
        .output()
        .expect("Failed to execute Node.js script");
    if !agenda.status.success() {
        eprintln!(
            "Node.js script error: {}",
            String::from_utf8_lossy(&agenda.stderr)
        );
        return "".to_string();
    }
    let json_output = String::from_utf8_lossy(&agenda.stdout);
    json_output.to_string()
}

#[command]
async fn get_image_data(image_path: String) -> Result<String, String> {
    let image_path = image_path.trim().trim_matches(&['\'', ' ', ','][..]);
    if !std::path::Path::new(&image_path).exists() {
        if !image_path.starts_with("/") {
            return Ok("".to_string());
        }

        let canonical_path = std::fs::canonicalize(image_path)
            .map_err(|e| format!("Failed to resolve path: {} {}", image_path, e))?;
        let _image_data =
            fs::read(canonical_path).map_err(|e| format!("Failed to read image: {}", e))?;
        return Ok("".to_string());
    }

    match fs::read(image_path) {
        Ok(image_data) => {
            let base64_image = base64::encode(image_data);
            Ok(format!("data:image/png;base64,{}", base64_image))
        }
        Err(e) => Err(format!("Failed to read image: {}", e)),
    }
}

fn capture_screen() -> String {
    // TODO: remove hardcoded screenshot path
    let region = Command::new("slurp")
        .stdout(Stdio::piped())
        .spawn()
        .expect("failed slurp");

    let reverse = Command::new("grim")
        .arg("-g")
        .arg("screenshot.png")
        .stdin(region.stdout.unwrap())
        .output()
        .expect("failed grim");
    "".to_string()
}

fn ocr() -> String {
    capture_screen();
    let output = Command::new("node")
        .arg("scheduler.js")
        .arg("ocr")
        .arg("screenshot.png")
        .output()
        .expect("Failed to execute Node.js script");

    if !output.status.success() {
        eprintln!(
            "Node.js script error: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        return "".to_string();
    }
    String::from_utf8_lossy(&output.stdout).to_string()
}

#[command]
fn add_event_to_schedule() -> String {
    let output: String = ocr();
    println!("{}", output);
    let query = format!("An org mode entry looks like this:\n* TODO Schedule this \nSCHEDULED: <2025-02-07 Fri>\n:LOGBOOK:\nLINK: link to meeting?\nACTION: name_of_action\n:END:\n\
        From this text:'{}', generate an org entry", output);
    let json_query = serde_json::json!({ "prompt": query }).to_string();
    let output = Command::new("node")
        .arg("gemini.js")
        .arg("query")
        .arg(json_query)
        .output()
        .expect("Failed to execute Node.js script");

    if !output.status.success() {
        eprintln!(
            "Node.js script error: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        return "".to_string();
    }
    let output = String::from_utf8_lossy(&output.stdout);

    println!("Generated Org Entry: {}", output);

    let file_path = "../../scheduler.org";
    let mut file = OpenOptions::new()
        .create(true)
        .append(true)
        .open(file_path)
        .expect("Failed to open org file");

    if let Err(e) = writeln!(file, "\n{}", output) {
        eprintln!("Failed to write org entry: {}", e);
    } else {
        println!("Org entry added to file: {}", file_path);
    }
    output.to_string()
}

#[command]
fn get_desktop_icons() -> HashMap<String, String> {
    let output = Command::new("node")
        .arg("getIcons.js")
        .output()
        .expect("Failed to execute Node.js script");

    if !output.status.success() {
        eprintln!(
            "Node.js script error: {}",
            String::from_utf8_lossy(&output.stderr)
        );
        return HashMap::new();
    }

    let json_output = String::from_utf8_lossy(&output.stdout);
    match serde_json::from_str::<HashMap<String, String>>(&json_output) {
        Ok(icons) => icons,
        Err(err) => {
            println!("JSON parsing error: {}", err);
            HashMap::new()
        }
    }
}

#[command]
async fn hide_sidebar(window: Window) {
    window
        .get_webview_window("opilot_sidebar")
        .expect("no window labeled 'opilot_sidebar' found")
        .hide()
        .unwrap();
}

#[command]
async fn open_sidebar(window: Window) {
    window
        .get_webview_window("opilot_sidebar")
        .expect("no window labeled 'splashscreen' found")
        .show()
        .unwrap();
}

fn main() {
    let node_process = NodeProcess::new().expect("Failed to start Node.js sidecar process");
    let shared_node: SharedNodeProcess = Arc::new(Mutex::new(node_process));

    tauri::Builder::default()
        .manage(shared_node)
        .setup(|app| {
            let main_window = app.get_webview_window("main").unwrap();
            main_window.hide().unwrap();
            // let chat_window = app.get_webview_window("opilot_sidebar").unwrap();

            let gtk_window = gtk::ApplicationWindow::new(
                &main_window.gtk_window().unwrap().application().unwrap(),
            );

            let sidewindiow = tauri::WebviewWindowBuilder::new(
                app,
                "opilot_sidebar",
                tauri::WebviewUrl::External("https://example.com".parse().unwrap()),
            )
            .title("opilot_sidebar")
            .build()
            .expect("Failed to create window");

            gtk_window.set_app_paintable(true);

            let vbox = main_window.default_vbox().unwrap();
            main_window.gtk_window().unwrap().remove(&vbox);
            gtk_window.add(&vbox);

            gtk_window.init_layer_shell();

            let display = match gdk::Display::default() {
                Some(display) => display,
                None => {
                    eprintln!("Failed to get default display");
                    return Ok(());
                }
            };
            let monitors = display.n_monitors();

            for n in 0..monitors {
                let mon = match display.monitor(n) {
                    Some(mon) => mon,
                    None => {
                        eprintln!("Failed to get monitor {}", n);
                        return Ok(());
                    }
                };
                let geometry = mon.geometry();
                println!("Geometry: {} {}", geometry.width(), geometry.height());

                gtk_window.set_width_request(geometry.width());
                gtk_window.set_height_request(geometry.height() / 20);
                gtk_window.set_margin_bottom(0);
                gtk_window.set_margin_end(0);
                gtk_window.set_exclusive_zone(geometry.height() / 20);
                gtk_window.set_anchor(Edge::Bottom, true);
            }

            gtk_window.set_layer(gtk_layer_shell::Layer::Bottom);
            gtk_window.set_keyboard_interactivity(false);
            // gtk_window.gtk_layer_set_keyboard_mode();
            gtk_window.show_all();
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_desktop_icons,
            get_image_data,
            query_gemini,
            add_event_to_schedule,
            parse_agenda,
            open_sidebar,
            hide_sidebar,
            shutdown_node
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    app_lib::run();
}
