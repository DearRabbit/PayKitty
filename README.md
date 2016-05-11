
#Note
Do remember to use 
```
npm install pack-name --save
```
for saving it in the dependencies list.
>Node modules installed with the --save option are added to the dependencies list in the package.json file. Afterwards, running npm install in the app directory will automatically install modules in the dependencies list.

#Before Running
After cloning, run
```
npm install
```
About 'dependencies' in package.json, see [packagejson](http://javascript.ruanyifeng.com/nodejs/packagejson.html#toc2).

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
* In general, use *functionNamesLikeThis*, *variableNamesLikeThis*, *ClassNamesLikeThis*, *EnumNamesLikeThis*, *methodNamesLikeThis*, *CONSTANT_VALUES_LIKE_THIS*, *foo.namespaceNamesLikeThis.bar*, and *filenameslikethis.js*.