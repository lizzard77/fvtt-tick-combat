export async function setTicks(combatant, value = 0)
{
    const data = getCombatantData(combatant);   
    data.ticks = parseInt(value);
    if (value > 0)
        data.isWaiting = false;
    await setCombatantData(combatant, data);
}

export async function setNote(combatant, value = "")
{
    const data = getCombatantData(combatant);   
    data.notes = value;
    await setCombatantData(combatant, data);
}

export async function toggleWaiting(combatant)
{
    const data = getCombatantData(combatant);   
    data.isWaiting = !data.isWaiting;
    await setCombatantData(combatant, data);
}

export async function normalizeTicks()
{
    const sorted = getCombatantAndEventsList();
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

export function getCombatantAndEventsList()
{
    let combatants = game.combat?.combatants;
    if (!combatants)
        return [];
    
    let result = [];
    for (const combatant of combatants) {
        if (!combatant.hidden && !combatant.token.hidden && !combatant.isDefeated)
            result.push(getCombatantInfo(combatant));
    };

    let events = getEvents();

    if (!game.user.isGM)
        events = events.filter(e => !e.isHidden);

    let timelineItems = [...result, ...events];
    if (!timelineItems || timelineItems.length === 0) 
        return [];
    return timelineItems.sort((a, b) => a.ticks - b.ticks);
}

export function getCombatantInfo(combatant) {
    const data = getCombatantData(combatant);
    return {
        id: combatant._id,
        combatant: combatant,
        name: combatant.name,
        isEvent: false,
        ticks: data.ticks,
        canWait : (combatant.hasPlayerOwner || game.user.isGM) && data.ticks === 0,
        isWaiting: data.isWaiting,
        notes : data.notes,
        ffwd: data.ffwd
    };
}

function getCombatantData(combatant) {
    const str = combatant.getFlag('tick-combat', 'data') || '{ "ticks": 0, "isWaiting": false, "notes": "", "ffwd": 0 }';
    return JSON.parse(str);
}

async function setCombatantData(combatant, data) {
    await combatant.setFlag('tick-combat', 'data', JSON.stringify(data));
}

export async function addEvent(event)
{
    const events = await getEvents();
    event.id = crypto.randomUUID();
    event.isEvent = true;
    if (!event.ffwd)
        event.ffwd = 8;
    if (!event.repeating)
        event.ffwd = -1;
    events.push(event);
    await setEvents(events);
}

export async function removeEvent(event)
{
    const events = await getEvents();
    const index = events.indexOf(events.find(e => e.id === event.id));
    if (index > -1) {
        events.splice(index, 1);
        await setEvents(events);
    }
}

export async function updateEvent(event)
{
    const events = await getEvents();
    const index = events.indexOf(events.find(e => e.id === event.id));
    if (index > -1) {
        if (!event.repeating)
           event.ffwd = -1;
        events[index] = event;
        await setEvents(events);
    }
}

export async function toggleHideEvent(event)
{
    event.isHidden = !event.isHidden;
    await updateEvent(event);
}

export async function getEventById(id)
{
    const events = await getEvents();
    return events.find(e => e.id === id);
}

export function getEvents()
{
    const events = game.combat?.getFlag('tick-combat', 'events') || [];
    return events;
}

export async function setEvents(events)
{
    await game.combat?.setFlag('tick-combat', 'events', events);   
}

export async function clearEvents()
{
    await game.combat?.unsetFlag('tick-combat', 'events');
}

