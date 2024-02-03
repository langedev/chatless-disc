/**
 * @name chatlessdisc
 * @version 1.1.0
 * @description removes the chatting from disc, as god intended
 * @author Julia Lange
 *
 */

const TITLE = "chatless-disc";

function getChat() {
    let chatsPotentialChild = document.querySelector(
        "div > section[aria-label='Channel header']");
    if (chatsPotentialChild) {
        let chat = chatsPotentialChild.parentElement;
        return chat;
    }
    return null;
}

function removeChat() {
    let chat = getChat()
    if (chat) chat.style = "display: none";
}
function restoreChat() {
    let chat = getChat()
    if (chat) chat.style = "display: flex";
}

function expandSidebar() {
    let userArea = document.querySelector("section[aria-label='User area']");
    let sidebar = userArea.parentElement;
    sidebar.style = "width: 100%";
    removeChat();

    userArea.childNodes.forEach(node => {
        node.style = "justify-content: space-between";
    });
}

function contractSidebar() {
    let userArea = document.querySelector("section[aria-label='User area']");
    let sidebar = userArea.parentElement;
    sidebar.style = "";
    restoreChat();

    userArea.childNodes.forEach(node => {
        node.style = "";
    });
}

function addChannelClass() {
    let dms = document.querySelector("ul[aria-label='Direct Messages']");
    if (dms == null) return "";
    let friendsElement = dms.childNodes[1]
    if (friendsElement == null) return "";
    let channelClassName = friendsElement.className.split(" ")[0]
    if (channelClassName != "") {
        BdApi.DOM.addStyle(TITLE, `.${channelClassName} {
            max-width: 100%;
        }`);
    }
    return channelClassName;
}

function clickPopOut() {
    let popOutButton = document.querySelector("button[aria-label='Pop Out']");
    if (popOutButton == null) return;
    popOutButton.click();
}

function addToggleButton(button) {
    let muteButton = document.querySelector("div > button[aria-label='Mute']");
    if (muteButton == null) return;
    let buttonList = muteButton.parentElement;
    buttonList.prepend(button)

    enablePortraitStyle()
}

function enablePortraitStyle() {
    let portrait = document.querySelector("div[aria-label='Set Status']");
    if (portrait == null) return;
    portrait.style = "width: 100%; min-width: 0px";
}

function disablePortaitStyle() {
    let portrait = document.querySelector("div[aria-label='Set Status']");
    if (portrait == null) return;
    portrait.style = "";
}

function enableChanges() {
    expandSidebar();

    return true
}

function disableChanges() {
    contractSidebar();

    return false
}

function createToggleButton(onClickFunction) {
    let toggleButton = document.createElement("button");
    toggleButton.role = "switch";
    toggleButton.ariaLabel = "Chattless Toggle";
    toggleButton.className = "chattless_button";
    toggleButton.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;`
    toggleButton.addEventListener("click", onClickFunction);

    const div = document.createElement("div");
    div.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;`;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("aria-hidden", "false");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("viewBox", "0 0 512.08 512.08");

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("fill", "var(--interactive-normal)");
    path.setAttribute("d", "M256.04,0C134.28,0,35.208,97.248,35.208,216.8c0,66.56,30.208,127.776,83.168,169.216V512.08 \
        l103.552-81.2c11.536,1.776,22.992,2.688,34.112,2.688c121.76,0,220.832-97.232,220.832-216.768C476.872,97.248,377.8,0,256.04,0z \
         M444.872,216.8c0,44.336-16.064,85.056-42.768,116.928L140.408,71.024C172.408,46.656,212.456,32,256.04,32 \
        C360.168,32,444.872,114.912,444.872,216.8z M220.552,398.192l-7.104-1.312l-63.056,49.456v-76.432l-6.592-4.8 \
        C95.128,329.776,67.224,275.712,67.224,216.8c0-47.872,18.848-91.408,49.472-124.256l262.768,263.792 \
        c-33.136,28.096-76.224,45.232-123.408,45.232C244.536,401.568,232.6,400.416,220.552,398.192z");

    svg.appendChild(path);
    div.appendChild(svg);
    toggleButton.appendChild(div);

    return toggleButton;
}





class chatlessdisc {

    constructor() {
        this.enabled = false;
        this.channelActionsModule = BdApi.findModuleByProps('selectChannel');

        this.toggleButton = createToggleButton(async () => {
            if (this.enabled)
                this.enabled = disableChanges();
            else
                this.enabled = enableChanges();
        });
    }

    start() {
        this.enabled = enableChanges();
        addToggleButton(this.toggleButton);
        this.channelClassName = addChannelClass();

        BdApi.DOM.addStyle(TITLE, `.chattless_button:hover {
            background: rgba(255,255,255,0.125) !important;
        }`);

        BdApi.Patcher.instead(TITLE, this.channelActionsModule,
            "selectChannel", async (_, args, originalFunction) => {
                await originalFunction(...args);
                if (this.enabled) {
                    removeChat();
                    if (this.channelClassName == "")
                        this.channelClassName = addChannelClass();
                }
            });
        BdApi.Patcher.instead(TITLE, this.channelActionsModule,
            "selectVoiceChannel", async (_, args, originalFunction) => {
                await originalFunction(...args);
                if (this.enabled) {
                    await this.channelActionsModule.selectPrivateChannel(args[0]);
                    clickPopOut();
                }
            });
    }
    //Turn off and remove all parts of the plugin
    stop() {
        this.toggleButton.remove()
        disableChanges();
        BdApi.Patcher.unpatchAll(TITLE);
        BdApi.DOM.removeStyle(TITLE);
    }
}
