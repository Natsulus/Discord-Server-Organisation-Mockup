// [TODO]
// - jQuery UI Draggable and Sortable
// - Collection Servers to increase in size with an ease transition
// - Create a Dividers Mockup
// - Create a Folders Mockup (Vertical [https://www.reddit.com/r/discordapp/comments/60851n/discord_server_organisation_concepts/df4lhhf/] & Horizontal [Combination of Folder and Sliders concept])
// - Create a Stackable Groups Mockup
// - Create a Size Option Tile Mockup (Maybe, because it's a difficult concept to put together well when using circles)
// - NOTE: No Search Mockup as Quick Switcher (in Canary) is good enough
// - Eventually make a BD Plugin after working out the problems such as drag n drop for servers

class Server {
    constructor(serverId, iconId) {
        const guild = $("<div/>", {class: "guild server"});
        const draggable = $("<div/>").attr("draggable", "true");
        const guildInner = $("<div/>", {
            class: "guild-inner",
            style: "border-radius: 25px;"
        }).attr("draggable", "false");
        const a = $("<a/>", {
            class: "avatar-small",
            href: `/channels/${serverId}/${serverId}`,
            style: `background-image: url("https://cdn.discordapp.com/icons/${serverId}/${iconId}.webp"`
        }).attr("draggable", "false");

        guild.append(draggable.append(guildInner.append(a)));

        this.element = guild;
    }
}

const guildsAdd = $(".guild.guilds-add");
const servers = new Map();

servers.set("41771983423143937", "edc44e98a690a1f76c5ddec68a0a6b9e");
servers.set("86004744966914048", "c8d49dc02248e1f55caeb897c3e1a26e");
servers.set("222078108977594368", "721d5742f9d0603d01521ab3a2dfddaf");
servers.set("110373943822540800", "47336ad0631ac7aac0a48a2ba6246c65");
servers.set("137344473976799233", "ac60a2a132fca555058ca4938109051e");
servers.set("125440014904590336", "fa22b3f16ee9b6787923c410e386d64d");
servers.set("85338836384628736", "cd116a78b62e5b3835a699ba27e9ac32");
servers.set("201544496654057472", "4bc7e34733131ca3b56f3a57afd805af");
servers.set("181866934353133570", "7655a2257de26dfc69eef652f69e970f");
servers.set("172018499005317120", "7779c25d3fe1cc27d26cd1d51ca89a1b");
servers.set("132246326657286144", "c70cc0c3a0aa826d6a05de4757faca5a");
servers.set("95657260969103360", "5ee37d12d0f4aa05b5dba233fd8feb68");
servers.set("143686242687647745", "888c0ce816ae08a5b48c9091a9b441c4");
servers.set("209901593351421952", "091f3543bf0bf19b9ad2a7aab8ab9cae");
servers.set("137501694387945472", "175bb2cdb5905cb6e3cbb55cfcee6395");

for (const [id, icon] of servers) {
    const server = new Server(id, icon);

    guildsAdd.before(server.element);
}

$(".guild .guild-inner a").click(() => {
    return false;
});

// Modification Menu

const containerSelect = $("<select/>", {style: "width: 100px;"});
const collectionSelect = $("<select/>", {style: "width: 100px;"}).change(function() {
    containerSelect.empty();
    for (let i = 0; i < $(".collection")[this.selectedOptions[0].value].childNodes.length; i++) {
        containerSelect.append($("<option/>", {
            value: i,
            text: `Container ${i}`
        }));
    }
});

$("#collectionIndex").append(collectionSelect);
$("#containerIndex").append(containerSelect);

$("#addCollection").click(() => {
    addCollection();
    collectionSelect.find("option:last").prop("selected", true);
});

$("#removeCollection").click(() => {
    if (collectionSelect.children().length === 0) return;
    if (collectionSelect.children().length === 1) containerSelect.empty();
    const collectionIndex = collectionSelect.prop("selectedIndex");

    removeCollection(collectionSelect[0][collectionIndex].value);
    collectionSelect.children().last().remove();

    if (collectionSelect.children().length === collectionIndex) collectionSelect.find("option:last").prop("selected", true);
    else $(collectionSelect[0][collectionIndex]).prop("selected", true);
});

$("#addContainer").click(() => {
    addContainer(collectionSelect[0].selectedOptions[0].value);
    containerSelect.find("option:last").prop("selected", true);
});

$("#removeContainer").click(() => {
    if (containerSelect.children().length === 0) return;
    const containerIndex = containerSelect.prop("selectedIndex");

    removeContainer(collectionSelect[0].selectedOptions[0].value, containerSelect[0][containerIndex].value);
    containerSelect.children().last().remove();

    if (containerSelect.children().length === containerIndex) containerSelect.find("option:last").prop("selected", true);
    else $(containerSelect[0][containerIndex]).prop("selected", true);
});

$("#containerRadius").change(positionContainers);
$("#containerCentre").change(() => {
    const collection = $(".collection");

    collection.each(function(cIndex) {
        if ($(this).find(".container:not([removing])").length === 9) removeContainer(cIndex, 0);
    });
    positionContainers();
});

// Collections & Containers

function positionContainers() {
    const collection = $(".collection");
    let angle = Math.PI * 1.5;
    const radius = $("#containerRadius")[0].selectedOptions[0].value;

    collection.each(function() {
        const height = collection.height();
        const containers = $(this).find(".container:not([removing])");
        const step = (2 * Math.PI) / (containers.length - ($("#containerCentre").prop("checked") ? 1 : 0));
        const width = collection.width();

        containers.each(function(index) {
            if ($("#containerCentre").prop("checked") && index === 0) {
                $(this).css({
                    left: `${width / 2 - $(this).width() / 2}px`,
                    top: `${height / 2 - $(this).height() / 2}px`
                });
            } else {
                const x = Math.round(width / 2 + radius * Math.cos(angle) - $(this).width() / 2);
                const y = Math.round(height / 2 + radius * Math.sin(angle) - $(this).height() / 2);

                $(this).css({
                    left: `${x}px`,
                    top: `${y}px`
                });
                angle += step;
            }
        });
    });
}

function addCollection() {
    const collections = $(".collection");
    const collection = $("<div/>", {class: "collection"}).draggable({
        addClasses: false,
        axis: "y",
        connectToSortable: ".scroller.guilds",
        revert: "invalid",
        zIndex: 100
    });

    $("#collectionIndex").find("select").append($("<option/>", {
        value: collections.length,
        text: `Collection ${collections.length}`
    }));

    if (collections.length) collections.last().after(collection);
    else $(".guild-separator").after(collection);
}

function removeCollection(cIndex) {
    const collections = $(".collection");

    $(".container").addClass("moveAni");

    cIndex = typeof cIndex === "undefined" ? collections.length - 1 : cIndex;

    $(collections[cIndex]).remove();
}

function addContainer(cIndex) {
    const collections = $(".collection");

    $(".container").addClass("moveAni");

    cIndex = typeof cIndex === "undefined" ? collections.length - 1 : cIndex;

    const collection = $(collections[cIndex]);
    const checked = $("#containerCentre").prop("checked");

    if (!checked && collection[0].childNodes.length === 8) return;
    if (checked && collection[0].childNodes.length === 9) return;

    containerSelect.append($("<option/>", {
        value: collection[0].childNodes.length,
        text: `Container ${collection[0].childNodes.length}`
    }));

    const container = $("<div/>", {class: "container"}).css({
        left: `${collection.width() / 2 - 5}px`,
        top: `${collection.height() / 2 - 5}px`
    }).addClass("moveAni");

    collection.append(container);

    positionContainers();
}

function removeContainer(cIndex, index) {
    const collections = $(".collection");

    $(".container").addClass("moveAni");

    cIndex = typeof cIndex === "undefined" ? collections.length - 1 : cIndex;

    const collection = $(collections[cIndex]);
    const containers = collection.find(".container");

    index = typeof index === "undefined" ? containers.length - 1 : index;

    $(collection.find($(".container:not([removing])"))[index])
        .attr("removing", true)
        .css({
            left: `${collection.width() / 2 - 5}px`,
            top: `${collection.height() / 2 - 5}px`
        })
        .fadeOut(400, function() {
            $(this).remove();
        });

    positionContainers();
}

// Sortable

$(".scroller.guilds").sortable({
    axis: "y",
    revert: "invalid",
    items: ".server, .collection",
    placeholder: "guild guild-placeholder"
});

$(".server").draggable({
    addClasses: false,
    axis: "y",
    connectToSortable: ".scroller.guilds",
    revert: "invalid",
    zIndex: 100
});

let contextMenu = $($.parseHTML(`<div class="context-menu theme-dark" style="left: 0px; top: 0px;">
    <div class="item-group">
        <div class="item disabled">
            <span>Mark As Read</span>
            <div class="hint"></div>
        </div>
        <div class="item item-toggle">
            <div class="label">Server Mute</div>
            <div class="checkbox">
                <div class="checkbox-inner"><input type="checkbox" value="on"><span></span></div>
                <span></span>
            </div>
        </div>
        <div class="item item-subMenu">
            Server Settings
        </div>
        <div class="item">
            <span>Notification Settings</span>
            <div class="hint"></div>
        </div>
        <div class="item">
            <span>Privacy Settings</span>
            <div class="hint"></div>
        </div>
        <div class="item">
            <span>Change Nickname</span>
            <div class="hint"></div>
        </div>
    </div>
    <div class="item-group">
        <div class="item">
            <span>Create Text Channel</span>
            <div class="hint"></div>
        </div>
        <div class="item">
            <span>Create Voice Channel</span>
            <div class="hint"></div>
        </div>
    </div>
    <div class="item-group">
        <div class="item">
            <span>Copy ID</span>
            <div class="hint"></div>
        </div>
    </div>
</div>`));

$("body").append(contextMenu.hide());

$(".server").contextmenu(e => {
    e.preventDefault();
    contextMenu.css({left: `${e.clientX}px`, top: `${e.clientY}px`}).show();
});

$(document).click(e => {
    if (!e.target.className.includes("item-group")) contextMenu.hide();
});