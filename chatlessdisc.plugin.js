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
    if(chatsPotentialChild) {
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
    if(dms == null) return "";
    let friendsElement = dms.childNodes[1]
    if(friendsElement == null) return "";
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
    if(popOutButton == null) return;
    popOutButton.click();
}

function addToggleButton(button) {
    let muteButton = document.querySelector("div > button[aria-label='Mute']");
    if(muteButton == null) return;
    let buttonList = muteButton.parentElement;
    buttonList.prepend(button)

    enablePortraitStyle()
}

function enablePortraitStyle() {
    let portrait = document.querySelector("div[aria-label='Set Status']");
    if(portrait == null) return;
    portrait.style = "width: 100%; min-width: 0px";
}

function disablePortaitStyle() {
    let portrait = document.querySelector("div[aria-label='Set Status']");
    if(portrait == null) return;
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
    toggleButton.textContent = "💬";

    // Had to style instead of use the class, because otherwise the class
    // wouldn't work
    toggleButton.style = "height: 32px; width: 32px; border-radius: 4px; \
        background: transparent;"
    toggleButton.className = "chattless_button"
    toggleButton.addEventListener("click", onClickFunction);

    return toggleButton;
}

class chatlessdisc {

    constructor() {
        this.enabled = false;
        this.channelActionsModule = BdApi.findModuleByProps('selectChannel');

        this.toggleButton = createToggleButton(async () => {
            if(this.enabled)
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
