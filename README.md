# Nerman
Oh Hi There!

Yes, hello

Testing here

Nice

### **Scopes** - Justification
---

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

### **Permissions** - Justification
---

<dl>

   <dt><strong>Send Messages:</strong></dt>
   <dd>Needed for nerman to reply to interactions with messages.</dd>
   <br />

   <dt><strong>Embed Links:</strong></dt>
   <dd>Nerman includes this so that the link returned from the */noun* and */nouner* commands will have a small preview available rather than requiring the user to folow the hyperlink to see it.</dd>
   <br />

   <dt><strong>Attach Files:</strong></dt>
   <dd>Nerman needs to be able to attach files to messages in order to return \<MessageAttachment\> and add it to the interaction.reply() of the /noun && /nouner commands</dd>
   <br />

   <dt><strong>Use External Emojis:</strong></dt>
   <dd>Nerman needs to be able to use the outside/custom emojis in order to perform his voting actions.</dd>
   <br />

   <dt><strong>Add Reactions:</strong></dt>
   <dd>Nerman needs to be able to react to votes in order to invoke and prevent duplicate invocations of tweets, upon enough users holding *voter* role reaching the react threshold on a vote to tweet.</dd>
   <br />

   <dt><strong>Use Slash Commands:</strong></dt>
   <dd>Need to bought to use the custom slash commands built for users to perform lookup actions.</dd>
   <br />

</dl>

<br/>

### **OAuth2 - Template URL:**

https://discord.com/api/oauth2/authorize?client_id=xxxxxxxxxxxxxxxxxx&permissions=2147797056&redirect_uri=https%3A%2F%2Fwww.google.com&response_type=code&scope=applications.commands%20bot%20messages.read%20guilds.members.read%20guilds
