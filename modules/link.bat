cd basic-modules
call yarn link
cd ..

cd teams-module
call yarn link
cd ..

cd ..
call yarn link @aptero/axolotis-module-basic
cd modules

cd teams-module/modules/
call link.bat
cd ../..
