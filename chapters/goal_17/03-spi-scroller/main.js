/**
 * Ready replica: SPI scroller (#c21)
 * Embeds the full self-contained implementation from _ready/spi-scroller.
 */
window.AtlasReplica = {
  isStub: false,
  ready: true,

  async render(_scene, ctx) {
    const { chartEl, hidePlaceholder } = ctx;
    hidePlaceholder();

    if (chartEl.querySelector("iframe.spi-frame")) return;

    chartEl.innerHTML = "";
    const frame = document.createElement("iframe");
    frame.className = "spi-frame";
    frame.title = "SPI scroller";
    frame.src = "../../../_ready/spi-scroller/index.html";
    frame.style.cssText =
      "position:absolute;inset:0;width:100%;height:100%;border:0;background:#fff;";
    chartEl.appendChild(frame);
  },
};
