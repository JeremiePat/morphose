> **IMPORTANT:** _This is an early alpha release. The whole API is subject to change at any time. Feedback is highly welcomed, don't be shy and  [open issues!](https://github.com/JeremiePat/morphose/issues)_

# Morphose

**Morphose** is a toolbox to handle SVG Paths. One of its main goal is to provide a clean and efficient way to compute a transition between two SVG paths to create stunning visual effects.

## Install

```bash
npm i github.com:JeremiePat/morphose
```

## Usage

See the online documentation for details: [https://github.io/JeremiePat/morphose]()

### RoadMap

See: [GitHub project board](https://github.com/JeremiePat/morphose/projects) for details

As a quick overview, here are the V1 goals:

  - Provide an API to compute steps to transition from one path to another
  - Provide an API to convert SVG Paths to others 2D paths representation (at
    least canvas [Path2D](https://html.spec.whatwg.org/multipage/canvas.html#path2d-objects))
  - Provide an API to apply any 2D or 3D transformation matrix to a path and
    get the resulting new path.
  - Provide tools to smoothly animate SVG Path in any web context

And for later releases:

  - Extend SVG path grammar to future proposition from the draft
    [SVG Paths Spec](https://svgwg.org/specs/paths/)
