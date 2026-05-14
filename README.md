# Room Card Minimalist

[![homeassistant][homeassistant]][home-assistant]
[![hacs][hacs-badge]][hacs-url]
[![release][release-badge]][release-url]
[![prerelease][prerelease-badge]][release-url]
![downloads][downloads-badge]
![build][build-badge]
[![license][license-badge]][license-url]

![Card - Dark Theme](https://github.com/unbekannt3/hass-room-card-minimalist/blob/main/docs/images/cards-dark.png?raw=true)
![Card - Light Theme](https://github.com/unbekannt3/hass-room-card-minimalist/blob/main/docs/images/cards-light.png?raw=true)

A minimalist room card for Home Assistant inspired by [UI Lovelace Minimalist](https://ui-lovelace-minimalist.github.io/UI/usage/cards/card_room/). Features a room name, styled icon, optional secondary/tertiary info lines, and up to 4 entity state indicators.

Based on [patrickfnielsen/hass-room-card](https://github.com/patrickfnielsen/hass-room-card).

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
  - [Basic Settings](#basic-settings)
  - [Secondary & Tertiary Info](#secondary--tertiary-info)
  - [Icon & Background](#icon--background)
  - [Entity States](#entity-states)
  - [Conditional Visibility](#conditional-visibility)
  - [Multi-State Entities](#multi-state-entities)
  - [Climate Entities](#climate-entities)
  - [Color Templates](#color-templates)
- [Examples](#examples)
- [Layout & Theming](#layout--theming)
- [Internationalization](#internationalization)
- [Development](#development)

---

## Installation

### HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=unbekannt3&repository=room-card-minimalist)

Or search for "room-card-minimalist" in [HACS][hacs].

### Manual

1. Download `room-card-minimalist.js` from the [latest release][release-url]
2. Place it in your `config/www` folder
3. Add the resource:
   - **UI:** _Settings_ → _Dashboards_ → _Resources_ → _Add Resource_
     - URL: `/local/room-card-minimalist.js`
     - Type: `JavaScript Module`
   - **YAML:**

     ```yaml
     lovelace:
       resources:
         - url: /local/room-card-minimalist.js
           type: module
     ```

---

## Quick Start

```yaml
type: custom:room-card-minimalist
name: Living Room
icon: mdi:sofa
card_template: blue
secondary: "{{ states('sensor.living_room_temperature') }}°C"
tertiary: "{{ states('sensor.living_room_humidity') }}%"
```

---

## Configuration

The visual editor is fully supported. Below is the YAML reference.

### Basic Settings

| Name                           | Type    | Default    | Description                                                                                                                            |
| :----------------------------- | :------ | :--------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| `name`                         | string  | _Required_ | Room name                                                                                                                              |
| `icon`                         | string  | _Required_ | Room icon (e.g., `mdi:sofa`). Accepts Jinja template returning an icon name                                                            |
| `card_template`                | string  | —          | Color preset. Accepts preset name or Jinja template returning one. See [Color Templates](#color-templates)                             |
| `tap_action`                   | object  | —          | Action on tap. See [HA actions](https://www.home-assistant.io/dashboards/actions/)                                                     |
| `hold_action`                  | object  | —          | Action on hold                                                                                                                         |
| `double_tap_action`            | object  | `none`     | Action on double-tap                                                                                                                   |
| `use_template_color_for_title` | boolean | `false`    | Use preset color for room name                                                                                                         |
| `entities_reverse_order`       | boolean | `false`    | Align entity indicators to bottom                                                                                                      |
| `entities_two_columns`         | boolean | `false`    | **Advanced.** Render entities in two columns (up to 8 candidates per column, 4 visible each). See [Two Columns](#two-columns-advanced) |
| `entities`                     | list    | —          | Entity state indicators. See [Entity States](#entity-states)                                                                           |
| `show_glow`                    | boolean | `false`    | Enable glowing border. See [Glow](#glow)                                                                                               |
| `glow_condition`               | string  | —          | Jinja template controlling the glow. Glows when result is truthy                                                                       |
| `glow_color`                   | string  | —          | Custom glow color (supports templates). Empty = card preset color                                                                      |
| `glow_intensity`               | number  | `2`        | Glow strength `1`–`5` (blur/spread multiplier)                                                                                         |

### Templated Card Preset & Icon

`card_template` and `icon` both accept Jinja templates resolving to a preset name or icon name respectively.

```yaml
# Preset based on light state
card_template: "{{ 'lightgreen' if is_state('light.wohnzimmer','on') else 'red' }}"

# Preset based on numeric value
card_template: >
  {% set t = states('sensor.living_room_temperature') | float %}
  {% if t > 25 %}red{% elif t > 20 %}orange{% else %}lightblue{% endif %}

# Icon swapped by state
icon: "{{ 'mdi:sofa' if is_state('light.wohnzimmer','on') else 'mdi:sofa-outline' }}"
```

Resolved output must match an existing preset name (`red`, `lightgreen`, `blue`, …). See [Color Templates](#color-templates).

### Glow

Pulsing border driven by a Jinja template. The card glows whenever `glow_condition` evaluates to a truthy value (anything other than empty, `False`, `false`, `None`, `0`).

```yaml
show_glow: true
glow_condition: "{{ is_state('binary_sensor.living_room_motion', 'on') }}"
# optional, defaults to card preset color
glow_color: "{{ 'red' if is_state('alarm_control_panel.home', 'triggered') else 'gold' }}"
glow_intensity: 3 # 1 (subtle) to 5 (strong), default 2
```

More examples:

```yaml
# Glow when any light in the area is on
glow_condition: >
  {{ expand(area_entities('Living Room'))
     | selectattr('domain','eq','light')
     | selectattr('state','eq','on') | list | count > 0 }}

# Glow when vacuum is cleaning or returning
glow_condition: "{{ states('vacuum.roomba') in ['cleaning', 'returning'] }}"

# Glow when someone is home
glow_condition: "{{ is_state('person.alice', 'home') }}"
```

### Secondary & Tertiary Info

Display one or two additional info lines below the room name. Both support [Jinja2 templates](https://www.home-assistant.io/docs/configuration/templating/).

#### Secondary Info

| Name                               | Type    | Default | Description                             |
| :--------------------------------- | :------ | :------ | :-------------------------------------- |
| `secondary`                        | string  | —       | Text or template                        |
| `secondary_color`                  | string  | —       | Text color (supports templates)         |
| `use_template_color_for_secondary` | boolean | `false` | Use preset color instead                |
| `secondary_allow_html`             | boolean | `false` | Allow HTML (security risk if untrusted) |
| `secondary_entity`                 | string  | —       | Entity for actions (e.g., `more-info`)  |
| `secondary_tap_action`             | object  | —       | Action on tap                           |
| `secondary_hold_action`            | object  | —       | Action on hold                          |
| `secondary_double_tap_action`      | object  | `none`  | Action on double-tap                    |

#### Tertiary Info

| Name                              | Type    | Default | Description                             |
| :-------------------------------- | :------ | :------ | :-------------------------------------- |
| `tertiary`                        | string  | —       | Text or template                        |
| `tertiary_color`                  | string  | —       | Text color (supports templates)         |
| `use_template_color_for_tertiary` | boolean | `false` | Use preset color instead                |
| `tertiary_allow_html`             | boolean | `false` | Allow HTML (security risk if untrusted) |
| `tertiary_entity`                 | string  | —       | Entity for actions                      |
| `tertiary_tap_action`             | object  | —       | Action on tap                           |
| `tertiary_hold_action`            | object  | —       | Action on hold                          |
| `tertiary_double_tap_action`      | object  | `none`  | Action on double-tap                    |

**Example: Temperature & Humidity**

```yaml
secondary: "{{ states('sensor.temperature') }}°C"
tertiary: "{{ states('sensor.humidity') }}%"
tertiary_color: 'var(--info-color)'
```

**Example: Clickable secondary with history**

```yaml
secondary: "{{ states('sensor.temperature') }}°C"
secondary_entity: sensor.temperature
secondary_tap_action:
  action: more-info
```

### Icon & Background

Configure the room icon and its background circle/image.

| Name                       | Type    | Default | Description                                                |
| :------------------------- | :------ | :------ | :--------------------------------------------------------- |
| `icon_color`               | string  | —       | Icon color (supports templates). Empty = use preset color  |
| `background_type`          | enum    | `color` | `none`, `color`, `image`, or `person`                      |
| `background_circle_color`  | string  | —       | Circle color when `background_type: color`. Empty = preset |
| `background_image`         | string  | —       | Image URL/path when `background_type: image`               |
| `background_person_entity` | string  | —       | Person entity when `background_type: person`               |
| `background_image_square`  | boolean | `false` | Square image instead of circle                             |

**Background Type Options:**

| Type     | Description              | Fields                                                |
| :------- | :----------------------- | :---------------------------------------------------- |
| `none`   | No background            | —                                                     |
| `color`  | Colored circle (default) | `icon_color`, `background_circle_color`               |
| `image`  | Custom image             | `background_image`, `background_image_square`         |
| `person` | Person profile picture   | `background_person_entity`, `background_image_square` |

```yaml
# Color circle (default)
background_type: color
background_circle_color: "#FF5722"

# Person profile picture
background_type: person
background_person_entity: person.john
background_image_square: true

# Custom image
background_type: image
background_image: "/local/images/room.jpg"
```

### Entity States

You can configure up to 8 entity indicators. By default the first 4 **visible** entities are displayed on the card; set `entities_two_columns: true` to show all 8 in two columns (see [Two Columns](#two-columns-advanced) for caveats). Use `visibility_condition` to conditionally show/hide entities at runtime (e.g., hide AC in summer, show presence only when detected). Entities without a condition are always visible. When `entities_reverse_order` is enabled, the visible entities are aligned from bottom to top.

| Name                   | Type    | Default    | Description                                                                          |
| :--------------------- | :------ | :--------- | :----------------------------------------------------------------------------------- |
| `type`                 | enum    | _Required_ | `entity` or `template`                                                               |
| `title`                | string  | —          | Custom title for the editor (not displayed on card)                                  |
| `icon`                 | string  | _Required_ | Icon when on/active                                                                  |
| `icon_off`             | string  | —          | Icon when off (defaults to `icon`)                                                   |
| `visibility_condition` | string  | —          | Jinja2 template. Non-empty/truthy = visible, empty = always visible                  |
| `entity`               | string  | —          | Entity ID (required for `type: entity`)                                              |
| `on_state`             | string  | —          | State value considered "on" (required for non-climate)                               |
| `condition`            | string  | —          | Template condition (required for `type: template`)                                   |
| `show_value`           | boolean | `false`    | Display custom state value as label on the circle                                    |
| `value_template`       | string  | —          | Template for the value to be displayed as label                                      |
| `color_on`             | string  | —          | Icon color when on (supports templates)                                              |
| `color_off`            | string  | —          | Icon color when off (supports templates)                                             |
| `background_color_on`  | string  | —          | Background when on (supports templates)                                              |
| `background_color_off` | string  | —          | Background when off (supports templates)                                             |
| `template_on`          | string  | —          | Color preset when on. Accepts preset name or Jinja template returning a preset name  |
| `template_off`         | string  | —          | Color preset when off. Accepts preset name or Jinja template returning a preset name |
| `use_light_color`      | boolean | `false`    | Use actual light color (for `light.*` entities)                                      |
| `tap_action`           | object  | —          | Action on tap                                                                        |
| `hold_action`          | object  | —          | Action on hold                                                                       |
| `double_tap_action`    | object  | `none`     | Action on double-tap                                                                 |

**Entity example:**

```yaml
entities:
  - type: entity
    entity: light.ceiling
    icon: mdi:ceiling-light
    icon_off: mdi:ceiling-light-outline
    on_state: 'on'
    use_light_color: true
    tap_action:
      action: toggle
```

**Entity with value display:**

```yaml
entities:
  - type: entity
    entity: sensor.temperature
    icon: mdi:thermometer
    on_state: 'on'
    show_value: true
    value_template: "{{ states('sensor.temperature') }}°C" # Label below state icon
    template_on: orange
```

**Template example:**

```yaml
entities:
  - type: template
    icon: mdi:lightbulb-group
    icon_off: mdi:lightbulb-group-outline
    condition: >
      {% set count = expand(area_entities('Living Room'))
        | selectattr('domain','eq','light')
        | selectattr('state','eq','on') | list | count %}
      {% if count > 0 %}{{ count }}{% endif %}
    template_on: yellow
```

**Templated colors and presets:**

All color fields (`color_on`, `color_off`, `background_color_on`, `background_color_off`) and preset fields (`template_on`, `template_off`, and the multi-state/climate variants like `color_${state}`, `template_${mode}`) accept Jinja2 templates.

> **Note on `_on` vs `_off`:** the `_on` variants only apply when the entity is considered on (`on_state` matches for `type: entity`, or `condition` is truthy for `type: template`). When the entity is off, the `_off` variants are used. If you want the same template applied regardless of state, set it on both.

```yaml
entities:
  # Color follows sensor value
  - type: entity
    entity: sensor.battery_level
    icon: mdi:battery
    on_state: 'on'
    color_on: >
      {% set b = states('sensor.battery_level') | int(0) %}
      {% if b < 20 %}red{% elif b < 50 %}orange{% else %}green{% endif %}

  # Preset name picked by template
  - type: entity
    entity: light.ceiling
    icon: mdi:ceiling-light
    on_state: 'on'
    template_on: >
      {{ 'red' if is_state('alarm_control_panel.home','triggered') else 'yellow' }}
```

### Two Columns (Advanced)

Set `entities_two_columns: true` to show entities in two columns. Each column has its own pool of up to 8 candidate entities; the first 4 **visible** entities from each pool are displayed on the card (up to 8 icons total). The card has a fixed height, so anything beyond that is clipped — use `visibility_condition` per entity to control which candidates show up at runtime.

| Column | Position           | Config key       | Pool size | Visible |
| :----- | :----------------- | :--------------- | :-------- | :------ |
| Outer  | Next to room text  | `entities`       | 8         | First 4 |
| Inner  | Closer to the text | `entities_inner` | 8         | First 4 |

> ⚠️ **Warning:** the second column eats roughly 25% of the card width, leaving very little room for the room name and secondary/tertiary text. Long names will be truncated. On narrow dashboard columns (especially mobile) the result is unpredictable — verify it on every breakpoint you target.

```yaml
type: custom:room-card-minimalist
name: Server
icon: mdi:server
entities_two_columns: true
entities: # outer column
  - { type: entity, entity: switch.privacy, icon: mdi:cctv, on_state: 'on' }
  - { type: entity, entity: binary_sensor.internet, icon: mdi:web, on_state: 'on' }
  - { type: entity, entity: binary_sensor.host, icon: mdi:ubuntu, on_state: 'on' }
  - { type: entity, entity: switch.fan, icon: mdi:fan, on_state: 'on' }
entities_inner: # inner column
  - { type: entity, entity: sensor.cpu, icon: mdi:chip, on_state: 'on' }
  - { type: entity, entity: sensor.disk, icon: mdi:harddisk, on_state: 'on' }
  - { type: entity, entity: sensor.mem, icon: mdi:memory, on_state: 'on' }
  - { type: entity, entity: sensor.gpu, icon: mdi:expansion-card, on_state: 'on' }
```

`entities_inner` is only read when `entities_two_columns: true`.

### Conditional Visibility

```yaml
entities:
  # Always visible
  - type: entity
    entity: light.ceiling
    icon: mdi:ceiling-light
    on_state: 'on'

  # Only visible in winter (Oct-Mar)
  - type: entity
    title: 'Heating (Winter)'
    entity: climate.living_room
    icon: mdi:thermostat
    use_multi_state: true
    visibility_condition: >
      {{ now().month >= 10 or now().month <= 3 }}

  # Only visible in summer (Apr-Sep)
  - type: entity
    title: 'AC (Summer)'
    entity: climate.ac
    icon: mdi:air-conditioner
    on_state: 'cool'
    visibility_condition: >
      {{ now().month >= 4 and now().month <= 9 }}

  # Only visible when someone is home
  - type: entity
    entity: binary_sensor.motion
    icon: mdi:motion-sensor
    on_state: 'on'
    visibility_condition: >
      {{ is_state('person.john', 'home') }}
```

### Multi-State Entities

For entities with multiple states beyond on/off (e.g., vacuum robots, media players, climate), enable multi-state mode to configure each state individually.

**Supported entity types with auto-fill presets:**

- `vacuum` - idle, cleaning, paused, returning, docked, error
- `climate` - auto-filled from entity's available HVAC modes
- `media_player` - off, idle, playing, paused, buffering
- `alarm_control_panel` - disarmed, armed_home, armed_away, armed_night, triggered, pending, arming
- `lock` - locked, unlocked, locking, unlocking, jammed
- `cover` - open, closed, opening, closing
- `fan` - off, on, low, medium, high
- `humidifier` - off, on, humidifying, drying
- `water_heater` - off, eco, electric, gas, heat_pump, performance

When enabling multi-state mode, `custom_states` is automatically populated. You can remove states you don't need.

| Name                       | Type    | Default | Description                                               |
| :------------------------- | :------ | :------ | :-------------------------------------------------------- |
| `use_multi_state`          | boolean | `false` | Enable multi-state mode                                   |
| `custom_states`            | string  | —       | Comma-separated list of states (auto-filled from presets) |
| `icon_[state]`             | string  | —       | Icon for specific state                                   |
| `color_[state]`            | string  | —       | Icon color for specific state                             |
| `background_color_[state]` | string  | —       | Background color for specific state                       |
| `template_[state]`         | string  | —       | Color preset for specific state                           |

**Example: Vacuum Robot**

```yaml
entities:
  - type: entity
    entity: vacuum.robot
    icon: mdi:robot-vacuum # Fallback icon
    use_multi_state: true
    custom_states: 'idle, cleaning, paused, returning, error'
    icon_cleaning: mdi:robot-vacuum
    icon_idle: mdi:robot-vacuum-off
    icon_error: mdi:robot-vacuum-alert
    template_cleaning: green
    template_idle: grey
    template_paused: yellow
    template_error: red
    tap_action:
      action: more-info
```

### Climate Entities

Climate entities (`climate.*`) use the same multi-state system as other entities. When enabling multi-state mode, the HVAC modes are automatically populated from the entity's available modes.

| Name                      | Type    | Default | Description                                       |
| :------------------------ | :------ | :------ | :------------------------------------------------ |
| `use_multi_state`         | boolean | `false` | Enable multi-state mode for HVAC modes            |
| `custom_states`           | string  | —       | Auto-filled with entity's HVAC modes when enabled |
| `icon_[mode]`             | string  | —       | Icon for specific HVAC mode                       |
| `color_[mode]`            | string  | —       | Icon color for HVAC mode                          |
| `background_color_[mode]` | string  | —       | Background color for HVAC mode                    |
| `template_[mode]`         | string  | —       | Color preset for HVAC mode                        |

**Common HVAC modes:** `off`, `heat`, `cool`, `heat_cool`, `auto`, `dry`, `fan_only`

```yaml
entities:
  - type: entity
    entity: climate.living_room
    icon: mdi:thermostat
    use_multi_state: true
    custom_states: 'off, heat, cool, auto' # Auto-filled from entity
    icon_heat: mdi:fire
    icon_cool: mdi:snowflake
    template_off: grey
    template_heat: red
    template_cool: lightblue
    template_auto: green
```

> **Note:** Existing configurations using the legacy climate format (without `use_multi_state`) are automatically migrated.

### Color Templates

Available presets for `card_template`, `template_on`, `template_off`, and mode-specific templates:

| Name         | Preview                                                         | Hex       |
| :----------- | :-------------------------------------------------------------- | :-------- |
| `blue`       | ![#3D5AFE](https://dummyimage.com/15/3d5afe/3d5afe) Blue        | `#3D5AFE` |
| `lightblue`  | ![#03A9F4](https://dummyimage.com/15/03a9f4/03a9f4) Light Blue  | `#03A9F4` |
| `red`        | ![#F54436](https://dummyimage.com/15/f54436/f54436) Red         | `#F54436` |
| `green`      | ![#01C852](https://dummyimage.com/15/01c852/01c852) Green       | `#01C852` |
| `lightgreen` | ![#8BC34A](https://dummyimage.com/15/8bc34a/8bc34a) Light Green | `#8BC34A` |
| `yellow`     | ![#FF9101](https://dummyimage.com/15/ff9101/ff9101) Yellow      | `#FF9101` |
| `purple`     | ![#661FFF](https://dummyimage.com/15/661fff/661fff) Purple      | `#661FFF` |
| `orange`     | ![#FF5722](https://dummyimage.com/15/ff5722/ff5722) Orange      | `#FF5722` |
| `pink`       | ![#E91E63](https://dummyimage.com/15/e91e63/e91e63) Pink        | `#E91E63` |
| `grey`       | ![#9E9E9E](https://dummyimage.com/15/9e9e9e/9e9e9e) Grey        | `#9E9E9E` |
| `teal`       | ![#009688](https://dummyimage.com/15/009688/009688) Teal        | `#009688` |
| `indigo`     | ![#3F51B5](https://dummyimage.com/15/3f51b5/3f51b5) Indigo      | `#3F51B5` |

Templates use CSS variables (`--color-*`) which can be customized by themes like UI Lovelace Minimalist.

---

## Examples

### Full Configuration

```yaml
type: custom:room-card-minimalist
name: Living Room
icon: mdi:sofa
card_template: blue
use_template_color_for_title: true

# Text info
secondary: "{{ states('sensor.temperature') }}°C"
secondary_entity: sensor.temperature
secondary_tap_action:
  action: more-info
tertiary: "{{ states('sensor.humidity') }}%"

# Background
background_type: color

# Card actions
tap_action:
  action: navigate
  navigation_path: /lovelace/living-room

# Entity indicators
entities:
  - type: entity
    entity: light.ceiling
    icon: mdi:ceiling-light
    icon_off: mdi:ceiling-light-outline
    on_state: 'on'
    use_light_color: true
    tap_action:
      action: toggle

  - type: entity
    entity: binary_sensor.motion
    icon: mdi:motion-sensor
    icon_off: mdi:motion-sensor-off
    on_state: 'on'
    template_on: green

  - type: entity
    entity: climate.thermostat
    icon: mdi:thermostat
    use_multi_state: true
    custom_states: 'off, heat, cool'
    template_off: grey
    template_heat: red
    template_cool: lightblue
```

### HTML in Secondary/Tertiary

**⚠️ Security Warning:** Only enable `*_allow_html` if you trust the template source.

```yaml
secondary_allow_html: true
secondary: >
  {% set temp = states('sensor.temperature') | float %}
  {% if temp > 25 %}
    <span style="color: #F54436;">{{ temp }}°C</span>
  {% else %}
    <span>{{ temp }}°C</span>
  {% endif %}
```

---

## Layout & Theming

### Layout Tips

Due to the fixed card size, use stacks for better alignment:

```yaml
type: horizontal-stack
cards:
  - type: custom:room-card-minimalist
    # ...
  - type: custom:room-card-minimalist
    # ...
```

### Theme Compatibility

Should work with any theme. Recommended as personally used: [Material Design 3 Theme](https://github.com/Nerwyn/material-you-theme) with [Material You Utilities](https://github.com/Nerwyn/material-you-utilities).

---

## Internationalization

The editor automatically adapts to your Home Assistant language.

**Supported languages:**

- 🇺🇸 English
- 🇩🇪 German

Contributions welcome! See [Internationalization Guide](docs/Internationalization.md).

---

## Development

Requires Node.js 22+.

```bash
npm install           # Install dependencies
npm run watch         # Dev server on localhost:8080
npm run docker:start  # Start local HA on localhost:8123
npm run docker:stop   # Stop local HA
npm run build         # Production build
```

Add the dev resource in HA: `http://localhost:8080/room-card-minimalist.js` (JavaScript Module)

---

<!-- Badges -->

[homeassistant]: https://img.shields.io/badge/home%20assistant-%2341BDF5.svg?style=flat-square&logo=home-assistant&logoColor=white
[hacs-url]: https://github.com/hacs/integration
[hacs-badge]: https://img.shields.io/badge/hacs-default-orange.svg?style=flat-square
[release-badge]: https://img.shields.io/github/v/release/unbekannt3/room-card-minimalist?style=flat-square
[prerelease-badge]: https://img.shields.io/github/v/release/unbekannt3/room-card-minimalist?include_prereleases&style=flat-square&label=prerelease
[downloads-badge]: https://img.shields.io/github/downloads/unbekannt3/room-card-minimalist/total?style=flat-square
[build-badge]: https://img.shields.io/github/actions/workflow/status/unbekannt3/room-card-minimalist/build.yaml?branch=main&style=flat-square
[license-badge]: https://img.shields.io/github/license/unbekannt3/room-card-minimalist?style=flat-square&logo=opensourceinitiative&logoColor=white&color=0080ff

<!-- References -->

[home-assistant]: https://www.home-assistant.io/
[hacs]: https://hacs.xyz
[release-url]: https://github.com/unbekannt3/room-card-minimalist/releases
[license-url]: https://github.com/unbekannt3/room-card-minimalist/blob/main/LICENSE
