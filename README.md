# UI5 Model Inspector

This custom control exists so that troubleshooting your models is quick and easy. 

![Screenshot](screenshot.png)

## Installation

### Step 1
Add the control directory to the application directory (webapp) of your project (don't forget the `lib/` directory)

### Step 2
Register a module path for the custom control in the init method of your `manifest.json` file:

```
    "sap.ui5": {
        ...
        "resourceRoots": {
            "com.mitchbarry.controls": "../control"
        }
        ...
    }
```

### Step 3
Define the namespace in the top of your view `xmlns:x="com.mitchbarry.controls"`, e.g.:

```
    <mvc:View
	    controllerName="sap.ui.demo.controller.Main"
	    xmlns:html="http://www.w3.org/1999/xhtml"
	    xmlns:mvc="sap.ui.core.mvc"
	    xmlns:x="com.mitchbarry.controls"
	    xmlns="sap.m">
```

### Step 4
And just add: `<x:ModelInspector text="Inspect Models" />` to your view.

### Additional Help
Please see the `demo/` folder of the repository to see how it is used!

## Notes
README and general notes built on [@jpenninkhof](https://github.com/jpenninkhof)'s [openui5-qrcode](https://github.com/jpenninkhof/openui5-qrcode) control. 