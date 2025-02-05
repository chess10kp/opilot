// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64;
use std::io::{BufRead, BufReader, Write};
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::{collections::HashMap, fs};
use tauri::command;

#[command]
fn open_opilot_window(app: tauri::AppHandle) -> bool {
    let win_name = "opilot_sidebar";
    let _ = tauri::webview::WebviewWindowBuilder::new(
        &app,
        win_name,
        tauri::WebviewUrl::App("opilot".into()),
    );
    true
}

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
            .write_all(format!("{}\n", request.to_string()).as_bytes())
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
    println!("response: {}", response);
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

        let canonical_path = std::fs::canonicalize(&image_path)
            .map_err(|e| format!("Failed to resolve path: {} {}", image_path, e))?;
        let _image_data =
            fs::read(canonical_path).map_err(|e| format!("Failed to read image: {}", e))?;
        return Ok("".to_string());
    }

    match fs::read(&image_path) {
        Ok(image_data) => {
            let base64_image = base64::encode(image_data);
            Ok(format!("data:image/png;base64,{}", base64_image))
        }
        Err(e) => Err(format!("Failed to read image: {}", e)),
    }
}

#[command]
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

fn main() {
    let node_process = NodeProcess::new().expect("Failed to start Node.js sidecar process");
    let shared_node: SharedNodeProcess = Arc::new(Mutex::new(node_process));

    tauri::Builder::default()
        .manage(shared_node)
        .invoke_handler(tauri::generate_handler![
            get_desktop_icons,
            get_image_data,
            query_gemini,
            shutdown_node
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
    app_lib::run();
}
