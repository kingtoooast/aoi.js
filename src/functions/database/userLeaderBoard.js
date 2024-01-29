module.exports = async (d) => {
  const data = d.util.aoiFunc(d);
  if (data.err) return d.error(data.err);
  const [guildID = d.guild.id, variable, type = "asc", custom = `{top}. {username}: {value}`, list = 10, page = 1, table = d.client.db.tables[0], hideNegativeValue = false, hideZeroValue = false ] = data.inside.splits;

  if (!d.client.variableManager.has(variable, table)) return d.aoiError.fnError(d, 'custom', {}, `Variable "${variable}" Not Found`);

  if (!type || (type.toLowerCase() !== "asc" && type.toLowerCase() !== "desc")) return d.aoiError.fnError(d, 'custom', {}, `type must be "desc" or "asc"`)

  const result = [];
  const guild = await d.util.getGuild(d, guildID);

  let db = await d.client.db.all(table, (data) => { 
    return data.key.startsWith(variable.addBrackets()) && data.key.split("_").length === 3 && data.key.split("_")[2] == guildID
  }, list * page, type);

  let i = 0;
  for (const lbdata of db) {
      const key = lbdata.key.split("_")[1];
      let member = await d.util.getMember(guild, key);

      if (!member) {
        member = await d.util.getUser(d, key)
      }

      if (hideNegativeValue == true && lbdata.value < 0) continue;
      if (hideZeroValue == true && lbdata.value == 0) continue;

      const replacer = {
          "{value}": lbdata.value,
          "{top}": i + 1,
          "{username}": member.user?.username || member.username  || "Unknown Member",
          "{nickname}": member.nickname || "Unknown Member",
          "{displayName}": member.user?.displayName || member.displayName || "Unknown Member",
          "{tag}": member.user?.tag || member.tag || "Unknown Member",
          "{id}": member.user?.id || member.id || "Unknown Member",
          "{mention}": member.user || member || "Unknown Member",
      }

      let text = custom;

      if (text.includes("{value:")) {
        let sep = text.split("{value:")[1].split("}")[0];
        text = text.replaceAll(`{value:${sep}}`, lbdata.value.toLocaleString().replaceAll(",", sep));
      }

      for (const replace in replacer) {
          text = text.replace(new RegExp(replace, "g"), replacer[replace]);
      }

      result.push(text);
      i++
  }
  
  data.result = result.slice(page * list - list, page * list).join("\n");

  return {
      code: d.util.setCode(data),
  };
};
