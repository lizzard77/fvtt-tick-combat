import { addEvent, normalizeTicks, updateEvent } from "./data.js";

export async function editEvent(data, fn) {
    const isNew = !data.hasOwnProperty("id");
    data.isNew = isNew;
    
    const content = await renderTemplate("modules/tick-combat/templates/editEvent.hbs", data);
    const title = data.isEvent ? 
        (isNew ? "New Event" : "Edit Event") : 
        (isNew ? "New Actor" : "Edit Actor");
    
    new Dialog({
        title,
        content: content,
        default: "one",
        buttons: {
            one: {
                icon: '<i class="fas fa-check"></i>',
                label: "OK",
                callback: async (html) => {
                    data.name = html.find("#name").val();
                    data.notes = html.find("#notes").val();
                    if (html.find("#ticks").val())
                        data.ticks = parseInt(html.find("#ticks").val());
                    data.ffwd = parseInt(html.find("#ffwd").val());
                    data.repeating = html.find("#repeating").prop("checked")
                    if (fn) 
                        fn(data);
                }
            }
        }
    }).render(true);
}
