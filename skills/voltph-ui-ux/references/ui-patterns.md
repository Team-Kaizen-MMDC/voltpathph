# VoltPH UI Patterns

Standardized React/React Native patterns to elevate the "plain" UI.

## 📇 Premium Cards
Avoid flat, bordered boxes. Use soft shadows and generous padding.

```tsx
// Web (Tailwind-like style)
<div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow">
  <h3 className="text-lg font-semibold text-slate-900 mb-2">Station Name</h3>
  {/* Content */}
</div>
```

## 🔘 Modern Buttons
Use subtle gradients or solid bold colors with clear active states.

```tsx
// Web
<button className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-600 active:scale-95 transition-all">
  Start Charging
</button>
```

## 📱 Mobile List Items
Optimized for one-handed thumb navigation.

```tsx
// React Native
<TouchableOpacity style={{
  flexDirection: 'row',
  padding: 16,
  backgroundColor: '#fff',
  borderRadius: 12,
  marginBottom: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.05,
  shadowRadius: 8,
  elevation: 2
}}>
  {/* Icon and Text */}
</TouchableOpacity>
```

## 🗺 Map Overlays
Ensure high contrast and readability over complex map tiles.
- Use semi-transparent blurs (`backdrop-filter: blur(8px)`) for overlays.
- Text should always have high contrast (Carbon Black on Cloud White).
