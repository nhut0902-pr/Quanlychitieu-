import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        await page.goto('http://localhost:8000')

        # Click Games nav button
        await page.click('#nav-games')
        await page.wait_for_selector('.game-card.online-game')

        # Check for Caro Online card
        online_card = await page.query_selector('.game-card.online-game')
        if online_card:
            print("SUCCESS: Caro Online card found.")
            title = await online_card.query_selector('h3')
            print(f"Card Title: {await title.inner_text()}")
        else:
            print("FAILURE: Caro Online card not found.")

        # Check Service Worker version in file
        with open('sw.js', 'r') as f:
            sw_content = f.read()
            if 'travel-diary-v19' in sw_content:
                print("SUCCESS: SW version is v19.")
            else:
                print("FAILURE: SW version is not v19.")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
