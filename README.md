
#Note
Do remember to use 
```
npm install pack-name --save
```
for saving it in the dependencies list.

#Before Running
After cloning, run
```
npm install
```

>Node modules installed with the --save option are added to the dependencies list in the package.json file. Afterwards, running npm install in the app directory will automatically install modules in the dependencies list.

#Running
```
npm start
```
or
```
DEBUG=PayKitty npm start
```

#namespace

#styleguide
[google style guide](https://google.github.io/styleguide/javascriptguide.xml)
* Indent using spaces 2
* Private properties and methods should be named with a trailing underscore.
* Protected properties and methods should be named without a trailing underscore (like public ones).