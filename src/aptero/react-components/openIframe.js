
export function setupIframeButton(t){
  t.el.object3D.position.set(0, 0.12, 0.001);
  t.label.setAttribute("text", "value", "Open in tab");
  let iframeButton = document.createElement("a-entity");
  iframeButton.setAttribute("mixin", "rounded-text-action-button");
  iframeButton.setAttribute("position", "0 -0.12 0.001");
  iframeButton.setAttribute("is-remote-hover-target","");
  iframeButton.setAttribute("tags","singleActionButton: true; isHoverMenuChild: true;");
  iframeButton.setAttribute("open-iframe-button","");
  iframeButton.innerHTML = '<a-entity text="value:Open here; width:1.5; align:center;" text-raycast-hack="" position="0 0 0.02"></a-entity>';
  t.el.parentEl.appendChild(iframeButton);
}