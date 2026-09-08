import sys

from PIL import ImageDraw, ImageFont

# blockdiag (last released 2021) measures text via the removed
# PIL ImageDraw.textsize API, even when the output format is SVG. Patch it
# back in using the modern textbbox equivalent instead of pinning an old
# Pillow (no wheels exist for current Python).
def _textsize(self, text, font=None, *args, **kwargs):
    f = font or ImageFont.load_default()
    bbox = self.textbbox((0, 0), text, font=f)
    return (bbox[2] - bbox[0], bbox[3] - bbox[1])


ImageDraw.ImageDraw.textsize = _textsize


# blockdiag also calls the font's own removed getsize() directly (not just
# through ImageDraw), on both FreeTypeFont and the default bitmap ImageFont.
def _font_getsize(self, text, *args, **kwargs):
    bbox = self.getbbox(text)
    return (bbox[2] - bbox[0], bbox[3] - bbox[1])


ImageFont.FreeTypeFont.getsize = _font_getsize
ImageFont.ImageFont.getsize = _font_getsize

from blockdiag.command import main  # noqa: E402

sys.exit(main(sys.argv[1:]))
