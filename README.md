# Nerman

## Description

Nerman is a Discord governance bot designed with the express purpose of improving [Nouns](https://nouns.wtf/) community interactions, encouraging participation, and notifying community members of Noun proposals and sales.

## Development

### Requirements

---

To help develop Nerman, you will need the following:

-  **[Git](https://git-scm.com/):** For source code version control.
-  **[Node.js](https://nodejs.org/):** For the main development environment.
-  **[MongoDB](https://www.mongodb.com/):** For the database.
-  **[Discord](https://discord.com/):** To set up your own bot.
-  **[Alchemy](https://www.alchemy.com/):** To track Nouns' blockchain activity.

### Installation

---

To install Nerman, simply execute the following commands in the terminal:

```
git clone https://github.com/JoeCars/Nerman.git
cd Nerman
npm install
```

### Additional Setup

---

1. **Create a Discord bot:** Follow this guide on [how to setup a Discord bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-bot-s-token).
2. **Setup A Database:** This can either be a cloud server or a locally-run MongoDB server.
3. **Add Environmental Variables:** Ensure you add the appropriate environmental variables.

<!-- TODO: Add examples of the environmental variables needed. -->

Once everything is ready, you can start the bot using `npm start`.

### Bot Scopes

---

For the bot to work, you need to give it the following permissions and scopes. The reasons for needing each scope is provided.

<dl>

   <dt><strong>guilds:</strong></dt>
   <dd>Used to get all the active guild members before filtering them for role type in the voter threshold.</dd>
   <br />

   <dt><strong>guild.members.read:</strong></dt>
   <dd>Nerman needs this in order to analyze the users in possessions of the voting role, which are needed for voting threshold calculations.</dd>
   <br />

   <dt><strong>bot:</strong></dt> <dd> Need this to place the bot in the user's guild</dd>
   <br />

   <dt><strong>message.read:</strong></dt>
   <dd>Nerman requires this scope so that it can read messages from all channels, rather than being restricted to just the guilds/channels created by the app.</dd>
   <br />

   <dt><strong>application.commands:</strong></dt>
   <dd>This scope is added so that Nerman can use the slash commands available in the guild.</dd>
   <br />

</dl>

<br />

### OAuth2 Template URL

---

To invite the bot, you may be required to provide an OAuth2 URL. Please use the following template. Replace the `#` symbols after `client_id` with the client id value found in the Discord development portal.

```
https://discord.com/api/oauth2/authorize?client_id=##################&permissions=36507543616&redirect_uri=https%3A%2F%2Fwww.google.com&response_type=code&scope=guilds%20bot%20guilds.members.read%20applications.commands%20messages.read
```
