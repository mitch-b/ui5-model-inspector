# UI5 Model Inspector (Custom Control)

This custom control exists so that troubleshooting your models is quick and easy. 

The custom control is surfaced as a simple `sap.m.Button` which you can place in your 
footer (or other location), and launches a `sap.m.ResponsivePopover` when clicked 
containing all of the models available to the View. After choosing a model, you can 
drill down into the model's properties. If `"TwoWay"` binding is used by your model, 
any changes you make in the ModelInspector window will be immediately available 
in your application. 

### Purpose

Ultimately, you wouldn't want to release this custom control into production applications. 
So its usage will exist solely in the development and debugging phases of your project. 

## Example

### [View on GitHub Pages](https://mitch-b.github.io/ui5-model-inspector/demo/)

![Gif](http://i.imgur.com/Wxl7Yr3.gif)

> If you want to run the demo locally, please run your HTTP server at the root of this repo. 
This is required because both the `demo/` folder and the `control/` folder need to be 
accessible. If ran from within `demo/` then the custom control content cannot be loaded.

![Screenshot](http://i.imgur.com/hLtE5hk.png)

## Installation

### Step 1 - Download custom control

#### Using Bower 
Requires [Bower](https://bower.io/) NPM package installed.

Using your shell, change directory to your project's root folder.

```
$ bower install ui5-model-inspector
```

> If you encounter a `SELF_SIGNED_CERT_IN_CHAIN` error from Bower, add a 
`.bowerrc` file at your project root with `{ "strict-ssl": false }`.

#### Manual Download (without Bower)
Download the entire contents of the `control` folder of this repository by downloading ZIP. 

### Step 2 (optional) - Copy control assets into your app

> This is an optional step - skip if you do not need to include the files underneath your web application. In Step 3, you can reference the path as `../bower_components/ui5-model-inspector/control`.

Now that you have the required `.js` and `.xml` files to run this custom control, 
you'll want to copy them into your application directory so that it is included in your 
webapp deployment. 

Terminal steps (or use Windows Explorer/Finder/your editor/etc.)
```
$ mkdir -p webapp/control/mitchbarry
$ cp -r bower_components/ui5-model-inspector/control/* webapp/control/mitchbarry/
```

The end result should look similar to this:

![Folder Structure](http://i.imgur.com/3ms676n.png)

### Step 3 - Register Module Path
Register a module path for the custom control in the init method of your `manifest.json` file:

```
    "sap.ui5": {
        ...
        "resourceRoots": {
            "com.mitchbarry.controls": "./control/mitchbarry"
        }
        ...
    }
```

### Step 3 - Add `xmlns` Entry
Define the namespace in the top of your view `xmlns:x="com.mitchbarry.controls"`, e.g.:

```
    <mvc:View
	    controllerName="sap.ui.demo.controller.Main"
	    xmlns:html="http://www.w3.org/1999/xhtml"
	    xmlns:mvc="sap.ui.core.mvc"
	    xmlns:x="com.mitchbarry.controls"
	    xmlns="sap.m">
```

### Step 4 - Add Model Inspector Control
Simply add: `<x:ModelInspector text="Inspect Models" />` to your view where you want the button to appear.

Since `ModelInspector` extends `sap.m.Button`, all related properties are assignable (`enabled`, `visible`, etc).

## Additional Help
Please see the `demo/` folder of the repository to see how it is used!

## Notes
* The `demo/` application is a marginally modified copy of the ["Manage Products"](https://openui5.hana.ondemand.com/test-resources/sap/m/demokit/tutorial/worklist/07/webapp/test/mockServer.html) UI5 demo application created by the OpenUI5 team.
* README and general notes built on [@jpenninkhof](https://github.com/jpenninkhof)'s [openui5-qrcode](https://github.com/jpenninkhof/openui5-qrcode) control.
* **ModelInspector** will use a `JSONModel` of its own named `__ModelInspector`. If this is not available, the custom control will not properly function. 
