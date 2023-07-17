# Authorization

As a guild management and polling bot, Nerman comes with several permission levels to give users access to different commands on a hierarchical basis. This is intended to give guild owners and administrators confidence that the bot's abilities are not abused by unauthorized users.

## Permission Levels.

The following are the permission levels in Nerman. These are guild-specific unless otherwise stated, so high authorization in one guild does not provide you with the same permissions in another guild.

1. **General:** Any member of the guild.
2. **Nerman Admin:** Any member registered as an admin in the guild using the `/nerman admin add` command.
3. **Guild Admin:** Any member who has the administrator permission in the guild. This includes guild owners by default.
4. **Nerman Developer:** Any authorized member of the Nerman development team.

## Command Authorization

If a given command requires permission level 2, then any user with a permission level of 2 or higher will be able to execute the command. Similarly, any command can be executed by users with the appropriate permission level or higher. Here are the available commands.

<table>
	<tr>
		<th> Command </th>
		<th> Permission Level </th>
	</tr>
	<tr>
		<td> Cancel Poll </td>
		<td> 2 </td>
	</tr>
	<tr>
		<td> Export Poll Reasons </td>
		<td> 1 </td>
	</tr>
	<tr>
		<td> <code> /nerman admin add </code> </td>
		<td> 3 </td>
	</tr>
	<tr>
		<td> <code> /nerman admin display </code> </td>
		<td> 2 </td>
	</tr>
	<tr>
		<td> <code> /nerman admin remove </code> </td>
		<td> 3 </td>
	</tr>
	<tr>
		<td> <code> /nerman feeds add </code> </td>
		<td> 2 </td>
	</tr>
	<tr>
		<td> <code> /nerman feeds display </code> </td>
		<td> 1 </td>
	</tr>
	<tr>
		<td> <code> /nerman feeds remove </code> </td>
		<td> 2 </td>
	</tr>
	<tr>
		<td> <code> /nerman url add </code> </td>
		<td> 2 </td>
	</tr>
	<tr>
		<td> <code> /nerman url display </code> </td>
		<td> 1 </td>
	</tr>
	<tr>
		<td> <code> /nerman url remove </code> </td>
		<td> 2 </td>
	</tr>
	<tr>
		<td> <code> /nerman admin-check-voters </code> </td>
		<td> 4 </td>
	</tr>
	<tr>
		<td> <code> /nerman threshold </code> </td>
		<td> 2 </td>
	</tr>
	<tr>
		<td> <code> /nerman address </code> </td>
		<td> 1 </td>
	</tr>
	<tr>
		<td> <code> /nerman noun </code> </td>
		<td> 1 </td>
	</tr>
	<tr>
		<td> <code> /nerman create-poll </code> </td>
		<td> 2 </td>
	</tr>
	<tr>
		<td> <code> /nerman create-poll-channel </code> </td>
		<td> 3 </td>
	</tr>
	<tr>
		<td> <code> /nerman create-test-poll </code> </td>
		<td> 4 </td>
	</tr>
	<tr>
		<td> <code> /emit-test-poll </code> </td>
		<td> 4 </td>
	</tr>
	<tr>
		<td> <code> /nerman participation </code> </td>
		<td> 1 </td>
	</tr>
	<tr>
		<td> <code> /nerman regenerate-poll-message </code> </td>
		<td> 3 </td>
	</tr>

</table>
