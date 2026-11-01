package com.greg.zarnowski.smarthome.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** Forwards frontend routes to the React app, so page reloads work. */
@Controller
public class SpaForwardController {

    @GetMapping({"/{page:^(?!api$)[^.]*}", "/{page:^(?!api$)[^.]*}/{subPage:[^.]*}"})
    public String forward() {
        return "forward:/index.html";
    }
}
