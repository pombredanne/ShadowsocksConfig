const parseURI_ = typeof window === 'undefined' ?
    require('./ShadowsocksConfig').parseURI :
    window.parseURI;
class ShadowsocksConfigHTMLElement extends HTMLElement {
    constructor() {
        super();
        this.uri = this.getAttribute('uri') || '';
    }
    get uri() {
        return this.uri_;
    }
    set uri(uri) {
        this.config_ = uri ? parseURI_(uri) : null;
        this.uri_ = uri;
    }
    get config() {
        return this.config_;
    }
    get host() {
        return this.config_.host;
    }
    get port() {
        return this.config_.port;
    }
    get method() {
        return this.config_.method;
    }
    get password() {
        return this.config_.password;
    }
    get tag() {
        return this.config_.tag;
    }
}
window.customElements.define('shadowsocks-config', ShadowsocksConfigHTMLElement);
