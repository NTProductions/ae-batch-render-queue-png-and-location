// render all items in render queue to custom location and as PNG

var window = new Window("palette", "Render Items to PNG", undefined);
window.orientation = "column";

var groupOne = window.add("group", undefined, "");
var locationEditText = groupOne.add("edittext", undefined, "Render Location");
locationEditText.size = [220, 25];
var locationButton = groupOne.add("button", undefined, "...");
locationButton.size = [25, 25];

var groupTwo = window.add("group", undefined, "");
groupOne.orientation = "row";
var templatesDD = groupTwo.add("dropdownlist", undefined, getRenderTemplateNames());
templatesDD.selection = 0;
templatesDD.size = [260, 25];

var groupThree = window.add("group", undefined, "");
groupThree.orientation = "row";
var renderCheckbox = groupThree.add("checkbox", undefined, "Render");
renderCheckbox.value = false;
var renderButton = groupThree.add("button", undefined, "Change");

window.center();
window.show();

locationButton.onClick = function() {
    var folder = new Folder();
    folder = folder.selectDlg("Select Render Folder");
    if(folder.exists) {
        locationEditText.text = folder.fsName.replace(/%20/g, " ");
    }
}

renderButton.onClick = function() {
    if(app.project.renderQueue.items.length < 1) {
        alert("No render queue items");
        return false;
    }

    main(Folder(locationEditText.text), templatesDD.selection.toString(), renderCheckbox.value);
}

function main(renderFolder, templateName, renderBool) {
    var rqItem, module;
    for(var i = 1; i <= app.project.renderQueue.items.length; i++) {
        rqItem = app.project.renderQueue.item(i);
        
        module = rqItem.outputModule(1);
        module.file = File(renderFolder.fsName+"/"+rqItem.comp.name+".avi");
        module.applyTemplate(templateName);
    }


    if(renderBool) {
        app.project.renderQueue.render();
    var files = renderFolder.getFiles();
    for(var i = 0; i < files.length; i++) {
        if(files[i].fsName.indexOf("_00000.") != -1) {
            files[i].rename(files[i].name.replace("_00000", ""));
        }
    }
    
}
}

function getRenderTemplateNames() {
    var ogComp;

    if(app.project.activeItem != null) {
        if(app.project.activeItem instanceof CompItem) {
            ogComp = app.project.activeItem;
        }
    }
    var testComp = app.project.items.addComp("Test Comp", 100, 100, 1, 30, 30);
    var renderItem = app.project.renderQueue.items.add(testComp);
    var module = renderItem.outputModule(1);
    
    var names = [];
    var templates = module.templates;
    for(var r = 0; r < templates.length; r++) {
        if(templates[r].indexOf("_HIDDEN") == -1) {
        names.push(templates[r]);
        }
        }

        renderItem.remove();
        testComp.remove();
        if(ogComp) {
            ogComp.openInViewer();
        }

        return names;
}