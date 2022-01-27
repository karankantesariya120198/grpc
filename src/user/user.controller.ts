import { Controller, Get, Inject, OnModuleInit, Param } from '@nestjs/common';
import {
  ClientGrpc,
  GrpcMethod,
  GrpcStreamMethod,
} from '@nestjs/microservices';
import { Observable, ReplaySubject, Subject } from 'rxjs';
import { toArray } from 'rxjs/operators';

export interface UserById {
    id: number;
}

export interface User {
    id: number;
    name: string;
}

interface UserService {
  findOne(data: UserById): Observable<User>;
  findMany(upstream: Observable<UserById>): Observable<User>;
}

@Controller('user')
export class UserController implements OnModuleInit {
  private readonly items: User[] = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Doe' },
  ];
  private userService: UserService;

  constructor(@Inject('USER_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.userService = this.client.getService<UserService>('UserService');
  }

  // @Get()
  // getMany(): Observable<User[]> {
  //   const ids$ = new ReplaySubject<UserById>();
  //   console.log('1');
  //   console.log(ids$);
  //   ids$.next({ id: 1 });
  //   ids$.next({ id: 2 });
  //   ids$.complete();

  //   const stream = this.userService.findMany(ids$.asObservable());
  //   return stream.pipe(toArray());
  // }

  @Get(':id')
  getById(@Param('id') id: string): Observable<User> {
    console.log('Client Side');
    return this.userService.findOne({ id: +id });
  }

  @GrpcMethod('UserService')
  findOne(data: UserById): User {
    console.log('Server side');
    console.log('Grpc service Method');
    console.log(data);
    return this.items.find(({ id }) => id === data.id);
  }

  // @GrpcStreamMethod('UserService')
  // findMany(data$: Observable<UserById>): Observable<User> {
  //   const user$ = new Subject<User>();

  //   const onNext = (userById: UserById) => {
  //     const item = this.items.find(({ id }) => id === userById.id);
  //     user$.next(item);
  //   };
  //   const onComplete = () => user$.complete();
  //   data$.subscribe({
  //     next: onNext,
  //     complete: onComplete,
  //   });

  //   return user$.asObservable();
  // }
}