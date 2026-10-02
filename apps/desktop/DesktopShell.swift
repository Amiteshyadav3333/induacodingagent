import AppKit
import WebKit

final class IndusAppDelegate: NSObject, NSApplicationDelegate {
    private var window: NSWindow!

    func applicationDidFinishLaunching(_ notification: Notification) {
        let webView = WKWebView(frame: .zero)
        webView.load(URLRequest(url: URL(string: "http://127.0.0.1:5173")!))
        window = NSWindow(
            contentRect: NSRect(x: 0, y: 0, width: 1480, height: 940),
            styleMask: [.titled, .closable, .miniaturizable, .resizable],
            backing: .buffered,
            defer: false
        )
        window.title = "Indus Coding Agent"
        window.minSize = NSSize(width: 1000, height: 680)
        window.center()
        window.contentView = webView
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
    }

    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { true }
}

let app = NSApplication.shared
let delegate = IndusAppDelegate()
app.setActivationPolicy(.regular)
app.delegate = delegate
app.run()
