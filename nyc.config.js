module.exports = {
    "extends": "@istanbuljs/nyc-config-typescript",
    "all": true,
    //"check-coverage":true,
    "include":["src/**/*.ts","src/**/*.js"],
    "exclude":["src/workers/pdfjs-dist@2.1.266/build/pdf.worker.js"],
    "reporter":['lcov','text','html'],
    //"extension":['.ts']
};