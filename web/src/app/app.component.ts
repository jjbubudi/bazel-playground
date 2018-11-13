import { Component } from '@angular/core';
import { HelloRequest } from 'mono_repo/api_proto/hello_pb';
import { HelloServiceClient } from 'mono_repo/api_proto/hello_pb_service';
import { Bye } from 'mono_repo/api_proto/deep/bye_pb';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title: String = 'web';

  constructor() {
    const client = new HelloServiceClient("http://localhost:8081");

    client.sayHello(new HelloRequest(), (_, response) => {
      response
        ? this.title = response.getMessage()
        : null;
    });

    client
      .sayBye(new Bye())
      .on("data", (reply) => {
        this.title = reply.getMessage();
      })
      .on("end", () => {
        this.title = "Done!";
      });
  }
}
