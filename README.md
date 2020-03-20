# CasparCG Template Guide Graphic Files

[Click here for the Full Guide](https://app.gitbook.com/@chrisryanouellette/s/casparcg-html-template-guide/)

This repository holds all the required files to use the HTML template created in the guide within a CasparCG server. 

## Developing with a Web Server (Preferred)

1. Begin by cloning this repository into a folder with the name `html-lower-third` with the following command.

```
git clone https://github.com/chrisryanouellette/CasparCG-Guide-HTML-Template.git html-lower-third
```

2. Then open a terminal / command prompt in the root folder ( `html-lower-third` ).
3. Run `npm install` to install all the dependencies.
4. Run `npm run-script http-server` to start the web server. You can visit `http://localhost:8080` and a folder directory of all the files will be displayed.
5. Run `npm run-script scss` to begin watching the `scss` folder for changes.

See the [Template Data](https://app.gitbook.com/@chrisryanouellette/s/casparcg-html-template-guide/javascript/handling-updates#template-data-setup) portion of the guide to see the data definition.

## Developing with CasparCG Server

1. Begin by cloning this repository into your CasparCG template's folder. 

```
git clone https://github.com/chrisryanouellette/CasparCG-Guide-HTML-Template.git
```

2. Then open a terminal / command prompt in the CasparCG template's folder. 
3. Run `npm install` to install all the dependencies.
4. Run `npm run-script scss` to begin watching the `scss` folder for changes.
5. Copy the HTML file you are developing, `css` and `js` folder to your server's template's folder.
6. Load the lower third with command `CG 1-1 ADD 0 lower-third.1 0`.