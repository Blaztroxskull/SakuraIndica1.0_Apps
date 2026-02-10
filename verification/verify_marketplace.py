from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5174")

        # Wait for loading to finish (text "Memuat Aplikasi..." disappears)
        # Or wait for "Sakura Indica" in sidebar
        page.wait_for_selector("text=Sakura Indica", timeout=10000)

        # Click "Marketplace" in sidebar
        # The sidebar buttons have text.
        page.get_by_text("Marketplace").click()

        # Wait for Marketplace title
        expect(page.get_by_text("Pasar Warga (Marketplace)")).to_be_visible()

        # Take screenshot of Marketplace
        page.screenshot(path="verification/marketplace.png")
        print("Marketplace screenshot taken.")

        # Click "Mode Admin" button in header
        page.get_by_text("Mode Admin").click()

        # Wait for Modal title
        expect(page.get_by_text("Login Administrator")).to_be_visible()

        # Take screenshot of Login Modal
        page.screenshot(path="verification/admin_login.png")
        print("Admin Login screenshot taken.")

    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="verification/error.png")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
