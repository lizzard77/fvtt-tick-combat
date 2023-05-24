import { addEvent, normalizeTicks, updateEvent } from "./data.js";

export async function editEvent(data) {
    const isNew = !data.hasOwnProperty("id");
    data.isNew = isNew;
    const myContent = await renderTemplate("modules/tick-combat/templates/addEvent.hbs", data);
    new Dialog({
        title: isNew ? "New Event" : "Edit Event",
        content: myContent,
        default: "one",
        buttons: {
            one: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
                callback: async (html) => {
                    data.name = html.find("#name").val();
                    if (html.find("#ticks").val())
                        data.ticks = parseInt(html.find("#ticks").val());
                    data.ffwd = parseInt(html.find("#ffwd").val());
                    isNew ? await addEvent(data) : await updateEvent(data);
                    await normalizeTicks();
                }
            }
        }
    }).render(true);
}
