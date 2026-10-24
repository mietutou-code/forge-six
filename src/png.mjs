import { inflateSync, deflateSync } from "node:zlib";

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const crcTable = Array.from({ length: 256 }, (_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  }
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data = Buffer.alloc(0)) {
  const name = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4);
  checksum.writeUInt32BE(crc32(Buffer.concat([name, data])));
  return Buffer.concat([length, name, data, checksum]);
}

export function encodePng(width, height, rgba) {
  if (rgba.length !== width * height * 4) {
    throw new Error("RGBA buffer length does not match dimensions");
  }

  const rows = [];
  for (let y = 0; y < height; y += 1) {
    const start = y * width * 4;
    rows.push(Buffer.from([0]), rgba.subarray(start, start + width * 4));
  }

  const header = Buffer.alloc(13);
  header.writeUInt32BE(width, 0);
  header.writeUInt32BE(height, 4);
  header[8] = 8;
  header[9] = 6;

  return Buffer.concat([
    signature,
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(Buffer.concat(rows), { level: 9 })),
    chunk("IEND"),
  ]);
}

export function decodePng(buffer) {
  if (!buffer.subarray(0, 8).equals(signature)) {
    throw new Error("Not a PNG file");
  }

  let offset = 8;
  let width;
  let height;
  const compressed = [];

  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString("ascii", offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    offset += length + 12;

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6 || data[12] !== 0) {
        throw new Error("Only non-interlaced 8-bit RGBA PNG files are supported");
      }
    } else if (type === "IDAT") {
      compressed.push(data);
    } else if (type === "IEND") {
      break;
    }
  }

  if (!width || !height) {
    throw new Error("PNG is missing a valid IHDR chunk");
  }

  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const inflated = inflateSync(Buffer.concat(compressed));
  const output = Buffer.alloc(stride * height);
  let sourceOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = inflated[sourceOffset];
    sourceOffset += 1;
    const source = inflated.subarray(sourceOffset, sourceOffset + stride);
    sourceOffset += stride;
    const targetStart = y * stride;

    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? output[targetStart + x - bytesPerPixel] : 0;
      const up = y > 0 ? output[targetStart - stride + x] : 0;
      const upperLeft =
        y > 0 && x >= bytesPerPixel
          ? output[targetStart - stride + x - bytesPerPixel]
          : 0;
      let prediction = 0;

      if (filter === 1) prediction = left;
      else if (filter === 2) prediction = up;
      else if (filter === 3) prediction = Math.floor((left + up) / 2);
      else if (filter === 4) {
        const p = left + up - upperLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upperLeft);
        prediction = pa <= pb && pa <= pc ? left : pb <= pc ? up : upperLeft;
      } else if (filter !== 0) {
        throw new Error(`Unsupported PNG filter: ${filter}`);
      }

      output[targetStart + x] = (source[x] + prediction) & 0xff;
    }
  }

  return { width, height, rgba: output };
}

