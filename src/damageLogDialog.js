export async function damageLog(actor, type, amount)
{
    const setting = game.settings.get('tick-combat', 'damageTypes') || [];
    const data = { list : setting, actor, amount, type };
    const content = await renderTemplate("modules/tick-combat/templates/damageLogDialog.hbs", data);

    const d = new Dialog({
        title: type + " für " + actor.name + " eintragen",
        content,
        buttons: {
            one: {
                icon: '<i class="fas fa-check"></i>',
                label: "Eintragen",
                callback: () => {
                    console.log("Protokoll für Schaden/Heilung eingetragen");
                    const flag = actor.getFlag('tick-combat', 'damageLog') || [];
                    
                }
            },
            two: {
                icon: '<i class="fas fa-times"></i>',
                label: "Verwerfen"
                //callback: () => console.log("Protokoll für Schaden/Heilung verworfen")
            }
        },
        //default: "two",
        //render: html => console.log("Register interactivity in the rendered dialog")
        close: html => console.log("This always is logged no matter which option is chosen")
    }, { popout : true, top: 20 });
    await d.render(true);
}

   