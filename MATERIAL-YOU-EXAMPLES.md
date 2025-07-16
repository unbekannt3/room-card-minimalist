# Material-You Theme Kompatible Room Card

Diese erweiterte Version der Room Card ist speziell für Material-You Themes in Home Assistant optimiert.

## Neue Features

### 1. Runder Hintergrund für Raum-Icon

- Automatischer runder Hintergrund hinter dem Raum-Icon
- Konfigurierbare Farbe des Hintergrunds
- Kann optional deaktiviert werden

### 2. Verbessertes Layout

- Links: Raum-Icon mit rundem Hintergrund und Textinformationen
- Rechts: Bis zu 4 Entities vertikal angeordnet
- Moderne Material-You-kompatible Schatten und Hover-Effekte

### 3. Verbesserte Entity-Buttons

- Runde Buttons für jede Entity
- Konfigurierbare Hintergrundfarben für Ein/Aus-Zustand
- Hover-Effekte mit Skalierung

## Beispielkonfigurationen

### Basis-Konfiguration mit Template

```yaml
type: custom:room-card
name: 'Badezimmer'
icon: 'mdi:shower'
card_template: 'blue_no_state' # Wendet Template auf die ganze Karte an
secondary: "{{ states('sensor.bathroom_temperature') }}°C"
max_entities: 4
entities:
  - type: entity
    entity: light.bathroom_light
    on_state: 'on'
    icon: 'mdi:lightbulb'
    icon_off: 'mdi:lightbulb-off'
    templates_on: ['yellow_on']
    templates_off: ['yellow_off']
  - type: entity
    entity: binary_sensor.bathroom_motion
    on_state: 'on'
    icon: 'mdi:motion-sensor'
    icon_off: 'mdi:motion-sensor-off'
    templates_on: ['red_on']
    templates_off: ['green_off']
```

### Erweiterte Konfiguration wie UI-Lovelace-Minimalist

```yaml
type: custom:room-card
name: 'Badezimmer'
icon: 'mdi:shower-head'
card_template: 'red_no_state'
secondary: "{{ states('sensor.sensor_temperature_bathroom_temperature') }}°C"
tap_action:
  action: navigate
  navigation_path: 'bathroom'
max_entities: 4
entities:
  - type: entity
    entity: binary_sensor.bewegungsmelder_03_occupancy
    on_state: 'on'
    icon: 'mdi:motion-sensor'
    icon_off: 'mdi:motion-sensor-off'
    templates_on: ['red_on']
    templates_off: ['green_off']
    tap_action:
      action: more-info
  - type: entity
    entity: light.play_bar_badezimmer
    on_state: 'on'
    icon: 'mdi:lightstrip'
    icon_off: 'mdi:lightstrip-off'
    templates_on: ['blue_on']
    templates_off: ['blue_off']
    tap_action:
      action: toggle
  - type: entity
    entity: sensor.waschmaschine_wascht
    on_state: 'on'
    icon: 'mdi:washing-machine'
    icon_off: 'mdi:washing-machine-off'
    templates_on: ['yellow_on']
    templates_off: ['blue_off']
    tap_action:
      action: more-info
  - type: entity
    entity: sensor.trockner_trocknet
    on_state: 'on'
    icon: 'mdi:tumble-dryer'
    icon_off: 'mdi:tumble-dryer-off'
    templates_on: ['yellow_on']
    templates_off: ['blue_off']
    tap_action:
      action: more-info
```

### Manuelle Farben mit Template-Fallback

```yaml
type: custom:room-card
name: 'Wohnzimmer'
icon: 'mdi:sofa'
secondary: "{{ states('sensor.living_room_temperature') }}°C"
show_background_circle: true
background_circle_color: 'rgba(103, 80, 164, 0.3)'
icon_color: 'rgb(103, 80, 164)'
max_entities: 4
entities:
  - type: entity
    entity: light.living_room_main
    on_state: 'on'
    icon: 'mdi:ceiling-light'
    icon_off: 'mdi:ceiling-light-off'
    templates_on: ['yellow_on']
    templates_off: ['yellow_off']
    # Manuelle Farben überschreiben Templates
    color_on: '#FFD700'
    color_off: '#666666'
    background_color_on: 'rgba(255, 215, 0, 0.2)'
    background_color_off: 'rgba(102, 102, 102, 0.2)'
```

## Konfigurationsoptionen

### Hauptkonfiguration

- `card_template`: Wendet ein ULM-kompatibles Template auf die ganze Karte an
- `show_background_circle`: Zeigt runden Hintergrund hinter dem Icon (Standard: true)
- `background_circle_color`: Farbe des runden Hintergrunds (Standard: var(--accent-color))
- `icon_color`: Farbe des Haupt-Icons (Standard: rgb(var(--rgb-white)))
- `max_entities`: Maximale Anzahl von Entities (1-4, Standard: 4)

### Entity-Konfiguration

- `templates_on`: Array von Templates für "Ein"-Zustand (z.B. ['red_on', 'yellow_on'])
- `templates_off`: Array von Templates für "Aus"-Zustand (z.B. ['green_off', 'blue_off'])
- `background_color_on`: Hintergrundfarbe wenn Entity "an" ist (überschreibt Templates)
- `background_color_off`: Hintergrundfarbe wenn Entity "aus" ist (überschreibt Templates)
- `color_on`: Icon-Farbe wenn Entity "an" ist (überschreibt Templates)
- `color_off`: Icon-Farbe wenn Entity "aus" ist (überschreibt Templates)

### Verfügbare Templates

**No-State Templates:**

- `blue_no_state`, `red_no_state`, `green_no_state`, `yellow_no_state`
- `purple_no_state`, `orange_no_state`, `pink_no_state`

**State-Based Templates:**

- `red_on/red_off`, `green_on/green_off`, `blue_on/blue_off`
- `yellow_on/yellow_off`, `purple_on/purple_off`, `orange_on/orange_off`
- `pink_on/pink_off`

### Priorität der Farbeinstellungen

1. Manuelle Farben (`color_on`, `background_color_on`, etc.)
2. Entity-Templates (`templates_on`, `templates_off`)
3. Card-Template (`card_template`)
4. Standard-Farben

## CSS-Variablen für Anpassungen

Die Card unterstützt verschiedene CSS-Variablen zur weiteren Anpassung:

```css
:host {
	--icon-size: 2.5rem;
	--icon-background-size: 3.5rem;
	--state-icon-size: 1.2rem;
	--state-item-size: 2rem;
	--border-radius: 12px;
	--state-border-radius: 50%;
}
```

## Material-You Theme Kompatibilität

Diese Version ist speziell für Material-You Themes optimiert:

- Automatische Dark/Light Mode Anpassung
- Verwendung von Material-You Farbvariablen
- Verbesserte Z-Index-Behandlung
- Responsive Design für verschiedene Bildschirmgrößen

## Troubleshooting

### Icons nicht sichtbar

Wenn Icons nicht sichtbar sind, versuche explizite Farben zu setzen:

```yaml
icon_color: 'rgb(103, 80, 164)'
background_circle_color: 'rgba(103, 80, 164, 0.3)'
```

### Z-Index Probleme

Bei Problemen mit der Darstellung in Material-You Themes, füge diese CSS-Regeln hinzu:

```css
ha-card {
	z-index: 1 !important;
	position: relative !important;
}
```
