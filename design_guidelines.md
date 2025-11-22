# Design Guidelines: Live Library Occupancy Dashboard

## Design Approach

**Selected System**: Material Design (data-rich monitoring interface)
**Justification**: This is a utility-focused dashboard requiring clear data visualization, real-time updates, and strong visual feedback. Material Design excels at information-dense applications with emphasis on usability and readability.

## Core Design Principles

1. **Data First**: Occupancy number is the hero element
2. **Glanceable Information**: Users should understand status instantly
3. **Reliability**: Consistent layout builds trust in real-time data
4. **Clarity Over Decoration**: Minimize visual noise for monitoring context

## Typography

**Font Stack**: Google Fonts - Inter (via CDN)
- Display (occupancy count): 96px/bold (text-8xl/font-bold)
- Section headers: 24px/semibold (text-2xl/font-semibold)
- Body/labels: 16px/medium (text-base/font-medium)
- Metadata (timestamps): 14px/regular (text-sm/font-normal)

## Layout System

**Spacing Units**: Tailwind spacing of 2, 4, 6, 8, 12, 16
- Component padding: p-6 to p-8
- Section gaps: gap-4 to gap-8
- Card spacing: space-y-6

**Container**: Single-column centered layout, max-w-4xl mx-auto

## Component Library

### Primary Dashboard Card
- Large centered card containing main occupancy display
- Prominent numerical display with "People Currently Inside" label
- Status indicator (text-based: "Low/Medium/High Capacity" or visual capacity bar)
- Last updated timestamp
- Padding: p-8, rounded-lg borders

### Status Indicators
- Capacity visualization: Progress bar showing occupancy percentage
- Visual states tied to thresholds (0-30%, 30-70%, 70-100%)
- Clear numerical labels

### Secondary Information Cards
- Grid layout (grid-cols-1 md:grid-cols-3)
- Stats cards showing: Total Entries Today, Total Exits Today, Peak Occupancy
- Icon + number + label format
- Padding: p-6, consistent card styling

### Header
- Library name/logo
- Current date/time display
- Simple top bar with minimal branding

### Auto-refresh Indicator
- Small status badge showing "Live" or "Updating..." state
- Pulse animation on data refresh
- Positioned near timestamp

## Icons

**Library**: Heroicons (via CDN)
- Entry: arrow-right-on-rectangle
- Exit: arrow-left-on-rectangle  
- Occupancy: user-group
- Refresh/Live: arrow-path (rotating on update)

## Layout Structure

1. **Header Bar**: Minimal branding + live indicator
2. **Hero Data Section**: Massive occupancy number with status
3. **Statistics Grid**: 3-column card grid with daily metrics
4. **Footer**: API connection status, refresh settings

## Responsive Behavior

- Desktop: Full dashboard layout with 3-column stats grid
- Tablet: 2-column stats grid, maintain card-based layout
- Mobile: Single column stack, occupancy number scales to 72px (text-7xl)

## Animations

**Minimal approach**:
- Number transitions: Smooth counting animation when occupancy changes
- Refresh indicator: Subtle rotation on data fetch
- NO decorative animations - focus on data clarity

## Accessibility

- High contrast between text and backgrounds
- Clear focus states on interactive elements
- ARIA labels for status indicators
- Screen reader announcements for occupancy updates

## Images

**No images required** - This is a data dashboard prioritizing information density and real-time updates over visual imagery.