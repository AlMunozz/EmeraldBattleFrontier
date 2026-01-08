import csv, json, re
pokemon_data = {}

with open('Poke-Database.csv', 'r', encoding='utf-8-sig') as f:
    reader = csv.DictReader(f, delimiter=';')

    for row in reader:
        type_key = '\ufeffType' if '\ufeffType' in row else 'Type'
        species = row['Species'].strip().lower().replace(' ', '-').replace('.', '').replace("'", "")
        if not species: continue

        # Crea key única: species + set# + style
        unique_key = f"{species}-{row['Set#'].strip()}-{row['Style #'].strip()}"

        ev_raw = row['EV Spread'].strip()
        ev_numbers = re.findall(r'\d+', ev_raw)
        evs = [int(e) for e in ev_numbers[:6]] + [0]*(6-len(ev_numbers[:6]))

        pokemon_data[unique_key] = {
            'species': row['Species'].strip(),
            'type': row[type_key].strip(),
            'style': row['Style #'].strip(),
            'set': row['Set#'].strip(),
            'nature': row['Nature'].strip(),
            'item': row['Item'].strip(),
            'moves': [row['Move 1'].strip(), row['Move 2'].strip(), row['Move 3'].strip(), row['Move 4'].strip()],
            'ability': row['Possible Ability'].strip(),
            'evs': {'HP': evs[0], 'Atk': evs[1], 'Def': evs[2], 'SpA': evs[3], 'SpD': evs[4], 'Spe': evs[5]},
            'speed_tier': int(row['Speed'].strip())
        }

with open('pokemon.json', 'w') as f:
    json.dump(pokemon_data, f, indent=2)

print(f"{len(pokemon_data)} movesets totales generados")
print("Ejemplos Jolteon:", [k for k in pokemon_data.keys() if 'jolteon' in k])
