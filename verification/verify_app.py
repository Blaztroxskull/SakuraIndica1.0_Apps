from playwright.sync_api import sync_playwright

def verify_app_load():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            print("Navigating to app...")
            page.goto("http://localhost:4173")

            # Wait for the app to load (e.g., check for a known element)
            # Since we have auth logic, it might show "Memuat Aplikasi..." or redirect
            # Let's wait for a generic element or text to confirm it's not a 404 or white screen

            # Wait for the root element to be present
            page.wait_for_selector("#root")

            # Take a screenshot of the initial state
            print("Taking screenshot...")
            page.screenshot(path="verification/app_load.png")
            print("Screenshot saved to verification/app_load.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app_load()
