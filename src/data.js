
export async function setTicks(combatant, value = 0, ffwd = 0)
{
    await combatant.setFlag('tick-combat', 'ticks', value);
    if (value > 0)
        await combatant.unsetFlag('tick-combat', 'waiting');
    //if (ffwd)
    //    await combatant.setFlag('tick-combat', 'ffwd', ffwd);
    //await game.combat?.setInitiative(combatant.id, value);
}

export async function setNote(combatant, value = "")
{
    await combatant.setFlag('tick-combat', 'notes', value);
}

export async function toggleWaiting(combatant)
{
    const currentState = combatant.getFlag('tick-combat', 'waiting') || false;
    await combatant.setFlag('tick-combat', 'waiting', !currentState);
}

export async function normalizeTicks()
{
    const sorted = getList();
    if (!sorted.length)
        return;

    const onlyActive = sorted.filter(c => !c.isWaiting);
    if (!onlyActive.length)
        return;

    const normalize = onlyActive[0].ticks;

    for (const c of onlyActive)
    {
        const newTicks = c.ticks - normalize;
        if (c.isEvent)
        {
            c.ticks = newTicks;
            await updateEvent(c);
        } 
        else 
        {
            await setTicks(c.combatant, newTicks);
        }
    }

    await game.timeline.app.setPosition({});
}

export function getCombatant(id)
{
    let combatants = game.combat?.combatants;
    return combatants.find(c => c._id === id);
}

export function getList()
{
    let combatants = game.combat?.combatants;
    if (!combatants)
        return [];
    
    let result = [];
    for (const combatant of combatants) {
        if (!combatant.hidden && !combatant.token.hidden && !combatant.isDefeated)
            result.push(getCombatantInfo(combatant));
    };

    let events = game.combat?.getFlag('tick-combat', 'events') || [];

    if (!game.user.isGM)
        events = events.filter(e => !e.isHidden);

    let timelineItems = [...result, ...events];
    if (!timelineItems || timelineItems.length === 0) 
        return [];
    return timelineItems.sort((a, b) => a.ticks - b.ticks);
}

export function getCombatantInfo(combatant) {
    return {
        id: combatant._id,
        combatant: combatant,
        name: combatant.name,
        isEvent: false,
        ticks: parseInt(combatant.getFlag('tick-combat', 'ticks')),
        canWait : (combatant.hasPlayerOwner || game.user.isGM) && parseInt(combatant.getFlag('tick-combat', 'ticks')) === 0,
        isWaiting: combatant.getFlag('tick-combat', 'waiting') || false,
        notes : combatant.getFlag('tick-combat', 'notes') || "",
        ffwd: parseInt(combatant.getFlag('tick-combat', 'ffwd'))
    };
}

export async function addEvent(event)
{
    const events = await game.combat?.getFlag('tick-combat', 'events') || [];
    event.id = crypto.randomUUID();
    event.isEvent = true;
    if (!event.ffwd)
        event.ffwd = 8;
    if (!event.repeating)
        event.ffwd = -1;
    events.push(event);
    await game.combat?.setFlag('tick-combat', 'events', events);
}

export async function removeEvent(event)
{
    const events = await game.combat?.getFlag('tick-combat', 'events') || [];
    const index = events.indexOf(events.find(e => e.id === event.id));
    if (index > -1) {
        events.splice(index, 1);
        await game.combat?.setFlag('tick-combat', 'events', events);
    }
}

export async function clearEvents()
{
    await game.combat?.unsetFlag('tick-combat', 'events');
}

export async function updateEvent(event)
{
    const events = await game.combat?.getFlag('tick-combat', 'events') || [];
    const index = events.indexOf(events.find(e => e.id === event.id));
    if (index > -1) {
        if (!event.repeating)
           event.ffwd = -1;
        events[index] = event;
        await game.combat?.setFlag('tick-combat', 'events', events);
    }
}

export async function toggleHideEvent(event)
{
    event.isHidden = !event.isHidden;
    await updateEvent(event);
}

export async function getEventById(id)
{
    const events = await game.combat?.getFlag('tick-combat', 'events') || [];
    return events.find(e => e.id === id);
}