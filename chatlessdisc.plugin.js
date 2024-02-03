/**
 * @name chatlessdisc
 * @version 1.0.0
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

class chatlessdisc {

    constructor() {
        this.channelActionsModule = BdApi.findModuleByProps('selectChannel');
    }

    start() {
        expandSidebar();
        this.channelClassName = addChannelClass();

        BdApi.Patcher.instead(TITLE, this.channelActionsModule,
            "selectChannel", async (_, args, originalFunction) => {
            await originalFunction(...args);
            removeChat();
            if (this.channelClassName == "")
                this.channelClassName = addChannelClass();
        });
        BdApi.Patcher.instead(TITLE, this.channelActionsModule,
            "selectVoiceChannel", async (_, args, originalFunction) => {
            await originalFunction(...args);
            await this.channelActionsModule.selectPrivateChannel(args[0]);
            clickPopOut();
        });
    }
    //Turn off and remove all parts of the plugin
    stop() {
        contractSidebar();
        BdApi.Patcher.unpatchAll(TITLE);
        BdApi.DOM.removeStyle(TITLE);
    }
}
