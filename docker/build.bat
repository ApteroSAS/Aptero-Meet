rem call npm install
rem call npm run build

rem Cleaning
RMDIR /s /q .\www\

rem build app
cd ..
call npm i
call npm run build
cd docker
xcopy ..\dist .\www\ /s /e

rem build docker
docker build -t aptero-hub .
