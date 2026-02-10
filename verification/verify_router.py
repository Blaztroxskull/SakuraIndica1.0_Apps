from playwright.sync_api import sync_playwright, expect

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()
    try:
        page.goto("http://localhost:5175")

        # Verify Dashboard load
        expect(page.get_by_text("Dashboard")).to_be_visible()

        # Verify navigation to Marketplace
        page.get_by_text("Marketplace").click()

        # Verify URL change (This confirms router is working)
        # Note: In localhost, it might be /marketplace
        expect(page).to_have_url("http://localhost:5175/marketplace")

        # Take screenshot
        page.screenshot(path="verification/router_verification.png")
        print("Verification successful.")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        browser.close()

with sync_playwright() as playwright:
    run(playwright)
