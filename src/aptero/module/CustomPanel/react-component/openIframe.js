

export async function setupIframeButton(t) {
  console.dir(t.src);
  const link = document.createElement('a');
  link.href = t.src;
  const allowedHosts = [
    window.location.host,
    //"hubs.mozilla.com",
    //"alphahub.aptero.co",
  ];
  let allowedSRC = false;
  for (let i = 0; i < allowedHosts.length; i++) {
    if (allowedHosts[i] === link.host)
      allowedSRC = true;
  }
  //test if url is allowed host
  if (allowedSRC) return;
  
  // iframeable is dead, not big surprise, we don't use it anymore
  // The new code is on the open-media-button.js
  
  if (t.el.parentEl.children.length > 1) return; // Prevent adding buttons that already exist
  t.el.object3D.position.set(-0.35, 0.2, 0.001);
  t.el.object3D.scale.set(0.5, 0.5, 0.5);
  t.el.object3D.updateMatrix(); // Update the matrix: we need this because being async the position.set is ignored otherwise apparently
  let iframeButton = document.createElement("a-entity");
  iframeButton.setAttribute("mixin", "rounded-text-action-button");
  iframeButton.setAttribute("position", "0 0 0.001");
  iframeButton.setAttribute("is-remote-hover-target", "");
  iframeButton.setAttribute("tags", "singleActionButton: true; isHoverMenuChild: true;");
  iframeButton.setAttribute("open-iframe-button", "");
  iframeButton.innerHTML = '<a-entity text="value:Open here; width:1.5; align:center;" text-raycast-hack="" position="0 0 0.02"></a-entity>';
  t.el.parentEl.appendChild(iframeButton);
  
  return  "Tab out"
}