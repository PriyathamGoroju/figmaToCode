"use strict";
/// <reference path="./node_modules/@figma/plugin-typings/plugin-api.d.ts" />
figma.showUI(__html__);
figma.ui.onmessage = msg => {
    if (msg.type === 'figmaToCode') {
        const htmlCode = [];
        iterateLayers(figma.currentPage, htmlCode);
        const finalHTMLCode = htmlCode.join('\n');
        console.log(finalHTMLCode);
        figma.ui.postMessage({
            type: 'htmlCode',
            htmlCode: finalHTMLCode,
        });
    }
    else if (msg.type === 'cancel') {
        figma.closePlugin();
    }
};
function iterateLayers(node, htmlCode) {
    if ('children' in node) {
        let elementStartTag = '';
        if (node.type === 'FRAME') {
            elementStartTag = generateElementStartTag(node);
            htmlCode.push(elementStartTag);
        }
        for (const childNode of node.children) {
            iterateLayers(childNode, htmlCode);
        }
        if (node.type === 'FRAME' || node.type === 'GROUP') {
            const elementEndTag = '</div>';
            htmlCode.push(elementEndTag);
        }
    }
    else {
        const nodeHTMLCode = generateNodeHTMLCode(node);
        htmlCode.push(nodeHTMLCode);
    }
}
function generateElementStartTag(node) {
    const { x, y, width, height } = node;
    const backgroundColor = getBackgroundColor(node);
    return `<div style="position: absolute; top: ${y}px; left: ${x}px; width: ${width}px; height: ${height}px;background-color: ${backgroundColor};">`;
}
function generateNodeHTMLCode(node) {
    let nodeHTMLCode = '';
    if (node.type === 'RECTANGLE') {
        if (hasImageFill(node)) {
            const imageURL = getImageURL(node);
            return `<div style="position: absolute; top: ${node.y}px; left: ${node.x}px; width: ${node.width}px; height: ${node.height}px; background-image: url('${imageURL}'); background-size: cover;"></div>`;
        }
        else {
            const rectangleNode = node;
            const backgroundColor = getBackgroundColor(rectangleNode);
            nodeHTMLCode = `<div style="position: absolute; top: ${rectangleNode.y}px; left: ${rectangleNode.x}px; width: ${rectangleNode.width}px; height: ${rectangleNode.height}px; background-color: ${backgroundColor};"></div>`;
        }
    }
    else if (node.type === 'POLYGON') {
        const polygonNode = node;
        const backgroundColor = getBackgroundColor(polygonNode);
        const cornerRadius = getCornerRadius(polygonNode);
        const points = generatePolygonPoints(cornerRadius, polygonNode.width, polygonNode.height, polygonNode.pointCount);
        const polygonSVG = `<svg style="position: absolute; top: ${polygonNode.y}px; left: ${polygonNode.x}px;" width="${polygonNode.width}" height="${polygonNode.height}"><polygon points="${points}" style="fill:${backgroundColor}"/></svg>`;
        nodeHTMLCode = polygonSVG;
    }
    else if (node.type === 'TEXT') {
        const textNode = node;
        const textColor = getTextColor(textNode);
        nodeHTMLCode = `<div style="position: absolute; top: ${textNode.y}px; left: ${textNode.x}px; color: ${textColor};">${textNode.characters}</div>`;
    }
    else if (node.type === 'ELLIPSE') {
        const ellipseNode = node;
        const backgroundColor = getBackgroundColor(ellipseNode);
        const centerX = ellipseNode.x + ellipseNode.width / 2;
        const centerY = ellipseNode.y + ellipseNode.height / 2;
        const radiusX = ellipseNode.width / 2;
        const radiusY = ellipseNode.height / 2;
        const ellipseSVG = `<svg style="position: absolute; top: ${centerY}px; left: ${centerX}px; transform: translate(-50%, -50%);" width="${ellipseNode.width}" height="${ellipseNode.height}"><ellipse cx="${radiusX}" cy="${radiusY}" rx="${radiusX}" ry="${radiusY}" fill="${backgroundColor}"/></svg>`;
        nodeHTMLCode = ellipseSVG;
    }
    else if (node.type === 'FRAME') {
        const frameNode = node;
        const backgroundColor = getBackgroundColor(frameNode);
        const frameHTMLCode = `<div style="position: absolute; top: ${frameNode.y}px; left: ${frameNode.x}px; width: ${frameNode.width}px; height: ${frameNode.height}px; background-color: ${backgroundColor};"></div>`;
        nodeHTMLCode = frameHTMLCode;
    }
    return nodeHTMLCode;
}
function getCornerRadius(node) {
    if (typeof node.cornerRadius === 'number') {
        return node.cornerRadius;
    }
    // Use a default corner radius value
    return 0;
}
function generatePolygonPoints(cornerRadius, width, height, sides) {
    const angle = (2 * Math.PI) / sides;
    const radius = Math.min(width, height) / 2;
    const centerX = width / 2;
    const centerY = height / 2;
    let points = '';
    for (let i = 0; i < sides; i++) {
        const x = centerX + radius * Math.cos(i * angle);
        const y = centerY + radius * Math.sin(i * angle);
        points += `${x},${y} `;
    }
    return points.trim();
}
function getBackgroundColor(node) {
    if (Array.isArray(node.fills) && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.type === 'SOLID' && fill.visible) {
            const solidFill = fill;
            const { r, g, b } = solidFill.color;
            return rgbToHex({ r, g, b });
        }
    }
    return undefined;
}
function getTextColor(node) {
    if (Array.isArray(node.fills) && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.type === 'SOLID' && fill.visible) {
            const solidFill = fill;
            const { r, g, b } = solidFill.color;
            return rgbToHex({ r, g, b });
        }
    }
    return undefined;
}
function rgbToHex(rgb) {
    const { r, g, b } = rgb;
    const toHex = (c) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
function hasImageFill(node) {
    if (node.fills) {
        const fills = node.fills;
        const imageFills = fills.filter(fill => fill.type === 'IMAGE');
        return imageFills.length > 0;
    }
    return false;
}
function getImageURL(node) {
    var _a, _b;
    const fills = node.fills;
    const imageFills = fills.filter((fill) => fill.type === 'IMAGE');
    const imageUrl = (_a = imageFills[0].imageHash) !== null && _a !== void 0 ? _a : '';
    const y = figma.getImageByHash(imageUrl);
    console.log(y);
    const workableImageUrl = (_b = figma.getImageByHash(imageUrl)) === null || _b === void 0 ? void 0 : _b.getBytesAsync.name;
    return workableImageUrl || null;
}
// function getBackgroundColor(node: RectangleNode | FrameNode | EllipseNode): string | undefined {
//   if (Array.isArray(node.fills) && node.fills.length > 0) {
//     const fill = node.fills[0];
//     if (fill.type === 'SOLID' && fill.visible) {
//       const solidFill = fill as SolidPaint;
//       const { r, g, b } = solidFill.color;
//       return rgbToHex({ r, g, b });
//     }
//   }
//   return undefined;
// }
// function rgbToHex(rgb: { r: number; g: number; b: number }): string {
//   const { r, g, b } = rgb;
//   const toHex = (c: number) => {
//     const hex = Math.round(c * 255).toString(16);
//     return hex.length === 1 ? '0' + hex : hex;
//   };
//   return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
// }
// function generateHTMLCode(properties: { [key: string]: string }): string {
//   let htmlCode = '<div style="';
//   for (const key of Object.keys(properties)) {
//     htmlCode += `${key}: ${properties[key]}; `;
//   }
//   htmlCode += '"></div>';
//   return htmlCode;
// }
// function getTextColor(node: TextNode): string | undefined {
//   if (Array.isArray(node.fills) && node.fills.length > 0) {
//     const fill = node.fills[0];
//     if (fill.type === 'SOLID' && fill.visible) {
//       const solidFill = fill as SolidPaint;
//       const { r, g, b } = solidFill.color;
//       return rgbToHex({ r, g, b });
//     }
//   }
//   return undefined;
// }
