import asyncio
from playwright.async_api import async_playwright
import os

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()

        # Load the local index.html
        file_path = "file://" + os.path.abspath("index.html")
        await page.goto(file_path)

        print("Checking Navigation Buttons...")
        # Check if Kết Nối button exists
        btn_webrtc = await page.query_selector("#nav-webrtc")
        if btn_webrtc:
            print("SUCCESS: Kết Nối button found.")
            text = await btn_webrtc.inner_text()
            print(f"Button text: {text}")
        else:
            print("FAIL: Kết Nối button NOT found.")

        # Check for SVG icons in bottom-nav
        icons = await page.query_selector_all(".bottom-nav .nav-icon")
        print(f"Found {len(icons)} navigation icons.")
        if len(icons) >= 6:
            print("SUCCESS: All navigation icons are present.")
        else:
            print(f"FAIL: Only found {len(icons)} navigation icons.")

        # Check Games Section for SVGs
        await page.click("#nav-games")
        await asyncio.sleep(0.5)
        game_icons = await page.query_selector_all(".game-icon svg")
        print(f"Found {len(game_icons)} game icons.")
        if len(game_icons) > 0:
            print("SUCCESS: Game icons are SVGs.")
        else:
            print("FAIL: No SVG icons found in Games Hub.")

        # Check for WebRTC modal
        await page.click("#nav-webrtc")
        await asyncio.sleep(0.5)
        modal = await page.query_selector("#webrtc-modal")
        is_visible = await modal.is_visible()
        if is_visible:
            print("SUCCESS: WebRTC Modal is visible.")
            status_text = await page.inner_text("#webrtc-status-text")
            print(f"Status text: {status_text}")
        else:
            print("FAIL: WebRTC Modal is NOT visible.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
