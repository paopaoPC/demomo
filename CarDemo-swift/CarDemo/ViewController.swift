//
//  ViewController.swift
//  CarDemo
//
//  Created by shifangyuan on 2018/9/28.
//  Copyright © 2018年 石方圆. All rights reserved.
//

import UIKit
import JavaScriptCore

class ViewController: UIViewController, DoEventManagerDelegate {
    
    @IBOutlet weak var webView: UIWebView!
    
    var jsInstance = WebViewJSInstance()
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        
        self.navigationController?.navigationBar.isHidden = true
        
        var path : String = ""
        let accessToken = "QmnDFrjk0NjIFWYu3pGOF3SW51MfILsx"
        let refreshToken = "q2dCAAVygMDhDRpEY0LctgQ9fTohIIZO"
        path = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "initdata/changAnTelematics/whatsnew") ?? ""
        path = path + "?access_token=" + accessToken + "&refresh_token=" + refreshToken + "&platform=iOS&SERVICEMODEL=RELEASE"
        
        self.webView.allowsInlineMediaPlayback = true
        self.webView.mediaPlaybackRequiresUserAction = false
        self.webView.scrollView.bounces = false
        self.webView.delegate = self
        self.webView.loadRequest(URLRequest(url: URL(string: path)!))
        
        let eventManager = DoEventManager.shared()!
        eventManager.delegate = self
    }
    
    //DoEventManager  Delegate
    func javaScriptCallBack(_ jsname: String!) {
        DispatchQueue.main.async {
            self.webView.stringByEvaluatingJavaScript(from: jsname)
        }
    }
    
    func loginOutCarControlEvent() {
        print("已被挤掉线-----")
    }
    
    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
    }
}

extension ViewController: UIWebViewDelegate {

    func webView(_ webView: UIWebView, shouldStartLoadWith request: URLRequest, navigationType: UIWebViewNavigationType) -> Bool {
        print("加载的网页链接-------",request.url?.absoluteString ?? "")
        return true
    }
    
    func webViewDidStartLoad(_ webView: UIWebView) {
        let context = webView.value(forKeyPath: "documentView.webView.mainFrame.javaScriptContext") as? JSContext
        context?.setObject(jsInstance, forKeyedSubscript: "OSApp" as NSCopying & NSObjectProtocol)
    }
    
    func webViewDidFinishLoad(_ webView: UIWebView) {
        let context = webView.value(forKeyPath: "documentView.webView.mainFrame.javaScriptContext") as? JSContext
        context?.setObject(jsInstance, forKeyedSubscript: "OSApp" as NSCopying & NSObjectProtocol)
    }
}
