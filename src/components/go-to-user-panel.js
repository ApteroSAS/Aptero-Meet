/**
 * Stores networked avatar state.
 * 
 * @component go-to-user-panel
 */

 AFRAME.registerComponent('go-to-user-panel', {
    schema: {
    },
    init: function () {
      //this.el.addEventListener('click',this.clickfunc);
    },
   update: function () {},
   tick: function () {},
  remove: function () {},
   pause: function () {},
   clickfunc :function(){
      console.log("click");
   },
   play: function () {
      console.log("entity",this.el);
      this.el.addEventListener("statechanged", e=>{console.log("testzezfqzfgqegqgqergqe")})
      this.el.addEventListener("stateadded", e=>{console.log("testzezfqzfgqegqgqergqe")})
      
   }
  });
  
