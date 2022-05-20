// playwright.config.js
// @ts-check
/** @type {import('@playwright/test').PlaywrightTestConfig} */
// @ts-check

const config = {
    testDir:process.env.PW_TEST_DIR || "./playwright",
    webServer: {
        ignoreHTTPSErrors: true,
        command: 'yarn run ci:coverage:serve',
        url: 'https://localhost:'+(process.env.PW_PORT||"53000"),
        reuseExistingServer: !!process.env.CI,
        timeout: 120 * 1000
    },
    expect: {
        timeout: 2*60*1000,
    },
    use: {
        //channel:"chrome",
        permissions: ['microphone', 'camera'],
        browserOptions:{
            args:[
                //"--no-sandbox",
                //"--disable-setuid-sandbox",
                "--use-fake-device-for-media-stream",
                "--use-fake-ui-for-media-stream",
                //"--use-file-for-fake-video-capture=./data/fakeCameraCapureDP.y4m"
            ]
        },
        screenshot: 'only-on-failure',
        ignoreHTTPSErrors: true,
        baseURL: 'https://localhost:'+(process.env.PW_PORT||"53000"),
    }
};
module.exports = config;