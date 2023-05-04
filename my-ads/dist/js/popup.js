const popupTemplate='\n    <div class="popup hidden">\n        <div class="popup__header">\n            <span class="popup__cross icon-cross-svgrepo-com"></span>\n        </div>\n    </div>\n';function Popup(e={}){this.container=e.container,this.mainElement=(new DOMParser).parseFromString(popupTemplate,"text/html").body.firstChild,this.container.appendChild(this.mainElement),this.cover=cover,this.cover.addEventListener("click",(()=>{this.close()})),document.body.appendChild(this.cover),this.cross=this.mainElement.querySelector(".popup__cross"),this.cross.addEventListener("click",(e=>{e.stopPropagation(),this.close()})),this.header=this.mainElement.querySelector(".popup__header"),e.title&&this.header.insertAdjacentHTML("afterbegin",`<p>${e.title}</p>`),e.contentElement&&"object"==typeof e.contentElement&&(this.contentElement=e.contentElement,this.mainElement.appendChild(this.contentElement)),this.open=function(){this.mainElement.classList.remove("hidden"),this.cover.classList.remove("hidden")},this.close=function(){this.mainElement.classList.add("hidden"),this.cover.classList.add("hidden"),"function"==typeof e.onClose&&e.onClose.call(this)},this.isOpen=function(){return!this.mainElement.classList.contains("hidden")},this.setContent=function(e){e&&"object"==typeof e&&(this.contentElement&&"object"==typeof this.contentElement&&this.mainElement.removeChild(this.contentElement),this.contentElement=e,this.mainElement.appendChild(this.contentElement))},this.destroy=function(){this.container.removeChild(this.mainElement)}}