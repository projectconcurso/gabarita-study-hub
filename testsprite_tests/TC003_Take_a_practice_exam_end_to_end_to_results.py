import asyncio
from playwright import async_api
from playwright.async_api import expect

async def run_test():
    pw = None
    browser = None
    context = None

    try:
        # Start a Playwright session in asynchronous mode
        pw = await async_api.async_playwright().start()

        # Launch a Chromium browser in headless mode with custom arguments
        browser = await pw.chromium.launch(
            headless=True,
            args=[
                "--window-size=1280,720",         # Set the browser window size
                "--disable-dev-shm-usage",        # Avoid using /dev/shm which can cause issues in containers
                "--ipc=host",                     # Use host-level IPC for better stability
                "--single-process"                # Run the browser in a single process mode
            ],
        )

        # Create a new browser context (like an incognito window)
        context = await browser.new_context()
        context.set_default_timeout(5000)

        # Open a new page in the browser context
        page = await context.new_page()

        # Interact with the page elements to simulate user flow
        # -> Navigate to http://localhost:4173
        await page.goto("http://localhost:4173")
        
        # -> Click the 'Entrar' button to open the login form (index 3).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div[2]/header/div/div/div[2]/a/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Fill the email and password fields with the provided credentials and submit the login form.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div[2]/div/div/div[2]/form/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('felflexa@yahoo.com')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div/div[2]/div/div/div[2]/form/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('augusto14')
        
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div[2]/div/div/div[2]/form/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the full practice exams list by clicking 'Ver todos os simulados'.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div[2]/main/div/div/div[2]/div/div[2]/a/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the 'Novo Simulado' (New Simulated) dialog by clicking the 'Novo Simulado' button to create a practice exam.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div/div[2]/main/div/div/div/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the 'Escolaridade' (education level) dropdown in the 'Criar Novo Simulado' form to set the context for the simulado.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[4]/div[2]/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Select the 'Médio' option in the Escolaridade dropdown (choose the education level) and then wait for the form to update before continuing.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[5]/div/div/div[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Open the 'Nível de dificuldade' dropdown so a difficulty option can be chosen (this is required before creating the simulado).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[4]/div[2]/div[3]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Select the 'Médio' difficulty option to set the simulado difficulty, then continue filling the title and create the simulado.
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[5]/div/div/div[2]').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # -> Fill the 'Título do Simulado', the block's Matéria and Assunto fields, then click 'Criar Simulado' to create the practice exam.
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[4]/div[2]/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Simulado de Teste IA')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[4]/div[2]/div[5]/div[2]/div/div[2]/div/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Direito Penal')
        
        frame = context.pages[-1]
        # Input text
        elem = frame.locator('xpath=/html/body/div[4]/div[2]/div[5]/div[2]/div/div[2]/div[2]/input').nth(0)
        await asyncio.sleep(3); await elem.fill('Dosimetria')
        
        # -> Click the 'Criar Simulado' button to create the practice exam (this should close the modal and add the simulado to the list).
        frame = context.pages[-1]
        # Click element
        elem = frame.locator('xpath=/html/body/div[4]/div[2]/button').nth(0)
        await asyncio.sleep(3); await elem.click()
        
        # --> Assertions to verify final state
        frame = context.pages[-1]
        assert await frame.locator("xpath=//*[contains(., 'Pontuação')]").nth(0).is_visible(), "The results view should display the score and XP feedback after submitting the exam"
        await asyncio.sleep(5)

    finally:
        if context:
            await context.close()
        if browser:
            await browser.close()
        if pw:
            await pw.stop()

asyncio.run(run_test())
    