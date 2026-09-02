import sys
import diagrams

_orig_init = diagrams.Diagram.__init__


def _patched_init(self, name="diagram", filename="", direction="LR", **kwargs):
    kwargs["show"] = False
    kwargs["outformat"] = "svg"
    _orig_init(self, name, filename="output", direction=direction, **kwargs)


diagrams.Diagram.__init__ = _patched_init

with open(sys.argv[1], encoding="utf-8") as f:
    source = f.read()

exec(compile(source, "user_script.py", "exec"), {"__name__": "__main__"})
