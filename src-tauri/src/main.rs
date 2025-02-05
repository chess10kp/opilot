// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64;
use std::{io::BufReader, io::BufRead, collections::HashMap, fs, io::Read, process::Command, process::Stdio};
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

#[command]
fn start_chat(json_input: String) -> String {
    println!("start chat {}", json_input);
    let chat = Command::new("node")
        .arg("gemini.js")
        .arg("startChat")
        .arg(json_input)
        .output()
        .expect("Failed to execute Node.js script");
    if !chat.status.success() {
        eprintln!(
            "Node.js script error: {}",
            String::from_utf8_lossy(&chat.stderr)
        );
        return "".to_string();
    }
    let json_output = String::from_utf8_lossy(&chat.stdout);
    json_output.to_string()
}

#[command]
fn chat_message(json_input: String) -> String {
    let chat = Command::new("node")
        .arg("gemini.js")
        .arg("chat")
        .arg(json_input)
        .output()
        .expect("Failed to execute Node.js script");
    if !chat.status.success() {
        eprintln!(
            "Node.js script error: {}",
            String::from_utf8_lossy(&chat.stderr)
        );
        return "".to_string();
    }
    let json_output = String::from_utf8_lossy(&chat.stdout);
    json_output.to_string()
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
async fn query_gemini(prompt: String) -> Result<String, String> {
    let mut child = Command::new("node")
        .arg("gemini.js") 
        .arg(&prompt)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .map_err(|e| format!("Failed to start sidecar: {}", e))?;

    let stdout = child.stdout.take().ok_or("Failed to capture stdout")?;
    let mut reader = BufReader::new(stdout);
    let mut output = String::new();
    reader
        .read_line(&mut output)
        .map_err(|e| format!("Failed to read stdout: {}", e))?;

    // Wait for the child process to exit.
    let status = child
        .wait()
        .map_err(|e| format!("Failed to wait on child: {}", e))?;
    if !status.success() {
        let mut err_output = String::new();
        if let Some(mut stderr) = child.stderr {
            BufReader::new(&mut stderr)
                .read_to_string(&mut err_output)
                .ok();
        }
        return Err(format!("Sidecar exited with error: {}", err_output));
    }

    // Here, output is a JSON string. You can pass it as is (or parse it if needed).
    Ok(output)
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
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_desktop_icons,
            get_image_data,
            query_gemini,
            open_opilot_window,
            capture_screen,
            start_chat,
            chat_message,
            capture_screen,
        ])
        .run(tauri::generate_context!())
        .expect("failed to run app");
    app_lib::run();
}
