// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use base64;
use std::fs;
use std::process::Command;
use tauri::command;

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
async fn get_desktop_icons() -> Result<Vec<String>, String> {
    let output = Command::new("node")
        .arg("getIcons.js")
        .output()
        .map_err(|e| format!("Failed to execute Node.js script: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Node.js script failed: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let icon_paths: Vec<String> = String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|line| line.to_string())
        .collect();

    Ok(icon_paths)
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![get_desktop_icons, get_image_data])
        .run(tauri::generate_context!())
        .expect("failed to run app");
    app_lib::run();
}
