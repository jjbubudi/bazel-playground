package com.fp

import cats.effect.{ExitCode, IO, IOApp}
import com.fp.deep.bye.Bye
import com.fp.hello.HelloServiceGrpc.HelloService
import com.fp.hello.{HelloReply, HelloRequest, HelloServiceGrpc}
import io.grpc.ServerBuilder
import io.grpc.stub.StreamObserver

import scala.concurrent.{ExecutionContext, Future}

object Foo extends IOApp {

  class Impl extends HelloService {
    override def sayHello(request: HelloRequest): Future[HelloReply] = {
      Future.successful(HelloReply(message = s"Hello! ${request.name}!"))
    }
    override def sayBye(request: Bye, responseObserver: StreamObserver[HelloReply]): Unit = {
      (1 to 100).foreach { i =>
        responseObserver.onNext(HelloReply(i.toString))
        Thread.sleep(100)
      }
      responseObserver.onCompleted()
    }
  }

  override def run(args: List[String]): IO[ExitCode] = {
    for {
      server <- IO {
        ServerBuilder
          .forPort(50051)
          .addService(HelloServiceGrpc.bindService(new Impl, ExecutionContext.global))
          .build()
          .start()
      }
      _ <- IO(server.awaitTermination())
    } yield ExitCode.Success
  }
}
